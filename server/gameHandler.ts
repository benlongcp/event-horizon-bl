import express, { Request, Response } from 'express';
import database from './database/index.ts';
import createAction from './helpers/createAction.ts';
import calculateGameState from './helpers/calculateGameState.ts';
import calculatePlayerState from './helpers/calculatePlayerState.ts';
import generateResponse from './helpers/generateResponse.ts';
import { Prisma } from '@prisma/client';
import { connect } from 'http2';
import shuffle from './helpers/shuffle.ts';
import errorHandler from './helpers/misc/error_logging/errorHandler.ts';

export default async function gameHandler(req: any) {

  try {

    // get the current Round and peripherals
    const currentRound = await database.rounds.findFirst({
      where: { id: Number(req.body.data.round_id)},
      include: {
        round_effects: true,
        game_player_information: true,
        actions: true,
        actions_loaded: true,
      }
    })

    // if action is found belonging to player
    const playerHasAction = currentRound.actions.filter((action) => action.user_id === req.body.data.user_id)

    // if this is the first action submitted for a round
    if (playerHasAction.length > 0) {
      await createAction(req);
      return {
        "Success": true,
        "Message": `Action #1 created for User #${req.body.data.user_id} in Game #${currentRound.game_id} - Round #${currentRound.id}.`,
        "Waiting": true,
        "user_id": req.body.data.user_id
      }
    } else if (currentRound.actions.length === 0){

      await createAction(req);
      return {
        "Success": true,
        "Message": `Action #1 created for User #${req.body.data.user_id} in Game #${currentRound.game_id} - Round #${currentRound.id}.`,
        "Waiting": true,
        "user_id": req.body.data.user_id
      }

    // else if this is the second (and last) action submitted for a round
    } else if (currentRound.actions.length > 0){

      // create the action for this user
      await createAction(req);

      // then attempt to perform calculations, and store the results
      const updateState = await calculateGameState(req, currentRound.game_id);

      // acquire the current player information
      let updatePlayers = currentRound.game_player_information.slice();

      // end the current round
      await database.rounds.update({
        where: { id: req.body.data.round_id},
        data: { end_date: new Date() }
      })

      // create a new round for the game only after all calculations have succeeded
      const newRound = await database.rounds.create({
        data: { 
          game: { connect: {id: currentRound.game_id } },
          actual: currentRound.actual + 1
        }
      })

      // returns an array of new players after updates
      updatePlayers = calculatePlayerState(updatePlayers, updateState, newRound.id);

      // for every player, we create an updated snapshot of their health/armor on the next round
      for (let i = 0; i < updatePlayers.length; i++){
        const newPlayerInfo = await database.game_player_information.create({
          data: updatePlayers[i]
        })
      }

      // for every player, we find the current snapshot of their card deck
      const pullGameDeckStates = await database.game_card_states.findMany({
        where: { round_id: currentRound.id }
      });
      
      // for every player, we get a snapshot of their card deck after changes
      for (let i = 0; i < pullGameDeckStates.length; i++) {
        const newState = await database.game_card_states.create({ 
          data: {
            user: { connect: { id: pullGameDeckStates[i].user_id}},
            round: { connect: { id: newRound.id} },
            deck: pullGameDeckStates[i].deck,
            hand: pullGameDeckStates[i].hand
          }
        })
      }

      // finally we generate a response to be sent to the client
      const formattedResponse = await generateResponse(newRound.id, currentRound.id);

      return (formattedResponse);

    }


  } catch (error) {
    errorHandler(error);
    console.error(`Fatal error encountered within Rounds router (rounds.ts), error message follows: `, error);
    return {
      "Success": false,
      "Message": `Error on client in processing turn submission.`
    }
  }

};