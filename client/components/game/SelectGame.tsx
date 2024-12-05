import React from 'react';
import { useState } from 'react';
import MakeGame from './MakeGame';
import axios from 'axios'
import { useEffect } from 'react';

////////////////////////////
import { io } from "socket.io-client";
import GameController from './GameController';
import GameOver from './GameOver.tsx';
import UserDecks from './../cards/UserDecks.tsx'
import { use } from 'passport';
////////////////////////////

////////////////////////////
//creates front-end socket connection to the server
const socket = io("http://localhost:3000", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

// const socket = io("http://ec2-18-226-17-160.us-east-2.compute.amazonaws.com:3000", {
//   withCredentials: true,
//   extraHeaders: {
//     "my-custom-header": "abcd"
//   }
// });
////////////////////////////


const decks = [
  {name: "basic deck"},
  {name: "attack deck"},
  {name: "defense deck"}
]



export default function SelectGame({
  user
}){
  
  
  const [playClicked, setPlayClicked] = useState(false)
  const [makeClicked, setMakeClicked] = useState(false)
  const [deckSelected, setDeckSelected] = useState([])
  const [deckWasChosen, setDeckWasChosen] = useState(false)

  const [handSize, setHandSize] = useState(3)
  
  const [gameOver, setGameOver] = useState(false)
  const [gameWinner, setGameWinner] = useState(null)
  const [userDecks, setUserDecks] = useState<any[]>([])
  
  //create a state for the room (we'll probably want to make this a combination of both users' unique googleId or something plus an iterating game number?)
  const [session, setSession] = useState("")
  const [roundNum, setRoundNum] = useState(1)
  
  const [enemyId, setEnemyId] = useState(null)
  const [enemyName, setEnemyName] = useState('')

  const [roundInfo, setRoundInfo] = useState([])
  

  useEffect(()=>{

    // on arrival to this page, attempt to get the decks available
    // this allows the user to select from their current card decks
    axios.get(`/profile/decks/${user.id}`)
      .then((response) => {
        setUserDecks(response.data)
      })
      .catch((err) => { 
        console.error(err)
      })
  }, [])
  



  /*===============================================================================
    This function begins searching for a game; it technically creates a session if
    a session is not found. As a result, we have to use the onClickStopSearch 
    function to request to delete the game and end the "matchmaking" request.
  =================================================================================*/
  const onClickPlay = async () => {
      
    try {

      const game = await axios.post('/games', { "user_id": user.id });
      const round = await axios.get(`/games/rounds/${game.data.id}`)
      
      setSession(game.data.id);
      setRoundNum(round.data["Current Round"]);

      socket.emit("join_session", session, user, roundNum);

      // I don't know if putting an event listener here is an issue
      // this might need to be somewhere else?
      socket.on('session_players', (data: any) => {

        // when we receive emission, see if there is an enemy
        const enemy = data.filter((player) => {
          return (player.id !== user.id)
        })
        
        // if the filtered array contains an enemy
        if (enemy.length > 0) {
          setEnemyName(enemy[0].name);  // set that enemy's name
          setEnemyId(enemy[0].user_id); // set that enemy's user ID
          setRoundInfo(data)            // set the current round information
          setPlayClicked(true)          // then trigger Game Board conditional render
        }
      })

    } catch (error) {
      console.error(`Error on connecting to a game session.`)
    }
  }
  /*===============================================================================*/
  /*===============================================================================*/



  /*===============================================================================
    This function should enable a user to stop searching for a game (if none found)
  =================================================================================*/
  const onClickStopSearch = async () => {
    try {
      if (session) {
        await axios.delete(`/games/${session}`);
        // we also need to re-enable buttons so they can click play game again
      }
    } catch (error) {
      console.error(`Error on request to stop searching for a game session.`)
    }
  }
  /*===============================================================================*/
  /*===============================================================================*/




  /*===============================================================================
    This function will eventually enable the creation of a custom game
  =================================================================================*/
  const onClickMake = () =>{
    setMakeClicked(true)
  }
  /*===============================================================================*/
  /*===============================================================================*/



  /*===============================================================================
    Handles deck selection for entering a game
  ===============================================================================*/
  const handleDeckSelect = (e) =>{

    axios.get(`/profile/decks/specific/${userDecks[e.target.value].id}`)
      .then((response) => {

        console.log(`Fetching cards for selected deck:`, response);
        
        const cards = response.data
        setDeckWasChosen(true)
        setDeckSelected(cards)
      })

    const sendSelectedDeck = {
      selectedDeck: {
        connect: {
          id: userDecks[e.target.value].id
          }
        }
    }

    axios.patch(`/profile/${user.id}`, sendSelectedDeck)
  }
/*===============================================================================*/
/*===============================================================================*/

return(

<>


{!playClicked?


<div className='pt-15 flex h-full items-center justify-center min-h-screen bg-slate-900 dark:bg-black'>
  <div className='p-6 justify-items-center flex flex-col items-center'>

<div className='pt-8'>



<select id="deckSelect" onChange={(e)=>{handleDeckSelect(e)}}>
  <option value="">--select deck--</option>




  {userDecks.map((deck, index)=>{
    // console.log("index", index)
    
    return(
      <option key={deck.deck_name} value={index}>{deck.deck_name}</option>


    )
  })}






</select>
  </div>

<br></br>

  {deckWasChosen?

<>
<button className='bg-lime-200' onClick={onClickPlay}>PLAY NOW!</button>

<br></br>
</>

:

<>
<button className='cursor-not-allowed bg-gray' >PLAY NOW!</button>

<br></br>
</>
  }
  <button className='bg-lime-400' onClick={onClickMake}>CUSTOMIZE!</button>
  <br></br>
  <div>

    {!makeClicked?
      
      <UserDecks user={null}/>
    
      :
      <div className='flex flex-row p-4'>
  
        <UserDecks user={null}/>
        <MakeGame/>
      </div>
  }
</div>
</div>
</div>


:

<>
{gameOver?
<>
<GameOver gameWinner={gameWinner} user={user}/>

</>
:

<GameController
session={session}
socket={socket}
user={user}
setGameOver={setGameOver}
setGameWinner={setGameWinner}
userDecks={userDecks}
deckSelected={deckSelected}
handSize={handSize}
roundNum={roundNum}
setRoundNum={setRoundNum}
enemyId={enemyId}
roundInfo={roundInfo}
enemyName={enemyName}
setEnemyName={setEnemyName}
setEnemyId={setEnemyId}
/>
}
</>
}

</>

)
}