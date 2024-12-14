import React, { FC, useEffect, useState } from 'react';
import { GiRosaShield } from "react-icons/gi";
import { GiMachineGunMagazine } from "react-icons/gi";
import { GiRocket } from "react-icons/gi";
import axios from 'axios';
import { response } from 'express';

interface card {
  id: number,
  name: string,
  description: string,
  damage: number,
  armor: number,
  duration: number
}

const BasicMechanics = () => {

  const [cards, setCards] = useState([])

  useEffect(() => {
    axios.get('/cards')
      .then((response) => {
        setCards(response.data.slice(0, 3))
      })
      .catch((error) => {
        console.error(`Error on fetching cards for instructions page.`)
      })
  })

  return (
    <div id='basicMechanics' style={{ width: "80%"}}>
    
      {/* This section will display all buttons contained in one row, with very brief description */}
      <div id='basicMechanics-Overview' className='text-center'>

        <span className='text-center justify-items-center items-center pb-6' style={{width: "100%"}}>
          YOUR ACTIONS MATTER
        </span>

        <span className='grid grid-cols-3 gap-4 justify-items-center items-center pb-4 pt-6' style={{width: "100%"}}>
          <p>BLOCK</p>
          <p>LOAD</p>
          <p>FIRE</p>
        </span>

        {/* Buttons for overview */}
        <span className='grid grid-cols-3 gap-4 justify-items-center items-center' style={{width: "100%"}}>
          <button
            value='BLOCK'
            className='shadow-lg shadow-black h-20 w-20 aspect-square bg-blue-600 hover:bg-blue-900 border-slate-600 border-2 text-text dark:text-darkText font-bold text-xs
            sm:text-sm md:text-base lg:text-lg rounded-full justify-center items-center justify-items-center overflow-hidden text-ellipsis focus:ring-4 focus:ring-blue-600'
          >
            <GiRosaShield style={{fontSize: 50, pointerEvents: "none"}} />
          </button>
          <button
            value='LOAD'
            className='shadow-lg shadow-black h-20 w-20 aspect-square bg-yellow-300 hover:bg-yellow-600 border-slate-600 border-2 text-text dark:text-darkText font-bold text-xs
             sm:text-sm md:text-base lg:text-lg rounded-full justify-center items-center justify-items-center overflow-hidden text-ellipsis focus:ring-4 focus:ring-yellow-300'
          >
            <GiMachineGunMagazine style={{fontSize: 50, pointerEvents: "none"}} />
          </button>
          <button
            value='FIRE'
            className='shadow-lg shadow-black h-20 w-20 aspect-square bg-red-600 hover:bg-red-900 text-text dark:text-darkText border-slate-600 border-2 font-bold text-xs 
            sm:text-sm md:text-base lg:text-lg rounded-full justify-center items-center justify-items-center overflow-hidden text-ellipsis focus:ring-4 focus:ring-red-600'
          >
            <GiRocket style={{fontSize: 50, transform: "rotate(270deg)", pointerEvents: "none"}}/>
          </button>
        </span>

      </div>

      {/* This section will cover the BLOCK button specifically */}
      <div id='basicMechanics-BLOCK' className='flex flex-row p-16'>
        
        <div className='justify-items-center items-center justify-center flex' style={{minWidth: "15%"}}>
          <button
            className='shadow-lg shadow-black h-20 w-20 min-h-20 min-w-20 aspect-square bg-blue-600 hover:bg-blue-900 border-slate-600 border-2 text-text dark:text-darkText 
            font-bold text-xs sm:text-sm md:text-base lg:text-lg rounded-full justify-center items-center justify-items-center overflow-hidden 
            text-ellipsis focus:ring-4 focus:ring-blue-600'
          >
            <GiRosaShield style={{fontSize: 50, pointerEvents: "none"}} />
          </button>
        </div>

        <p className='pl-8'>
          The block mechanism is one of the most important functions that your ship is capable of performing.
          Whenever a ship attempts to block, it enables active shielding that will reduce incoming damage by 50%
          regardless of the current armor that the ship possesses. However, it's important to note that shielding
          consumes significant power...as a result your ship is unable to perform any actions on the same turn.
        </p>
      </div>

      {/* This section will cover the LOAD button specifically, it will be interactive with cards */}
      <div id='basicMechanics-LOAD' className='flex flex-row p-12'>
        
        <div className='justify-items-center items-center justify-center flex' style={{minWidth: "15%"}}>
          <button
            className='shadow-lg shadow-black h-20 w-20 min-h-20 min-w-20 aspect-square  bg-yellow-300 hover:bg-yellow-600 border-slate-600 border-2 text-text dark:text-darkText 
            font-bold text-xs sm:text-sm md:text-base lg:text-lg rounded-full justify-center items-center justify-items-center overflow-hidden 
            text-ellipsis focus:ring-4 focus:ring-yellow-300'
          >
            <GiMachineGunMagazine style={{fontSize: 50, pointerEvents: "none"}} />
          </button>
        </div>

        <p className='pl-8'>
          The load mechanism is the means by which your ship activates auxillary defense measures and prepares
          armaments. In layman's terms, this mechanism allows for you to deploy a card for use during gameplay!
          After loading a defensive card, defensive effects will apply on the following turn...but not on the same turn!
          If you need to immediately mitigate incoming damage, you should BLOCK. If you want to augment your defense for
          subsequent turns, then you would LOAD a defensive card. Any offensive (damage) card that is played will be loaded,
          but your ship must FIRE in order for the card to take effect.
        </p>
        
      </div>

      <div id='basicMechanics-LOAD-Cards' className='grid grid-cols-3 justify-center items-center justify-items-center'>
          { 
            cards.map((card: card) => (
              <div
                key={card.id}
                className={`shadow-black relative bg-white border border-slate-300 hover:scale-110 hover:z-20 mx-1 first:ml-0 my-1 rounded-lg shadow-lg flex-col justify-items-center text-black text-center flex-shrink-0 z-10 h-48 w-32'`}
                style={{ flex: '0 0 25%', minWidth: "32px", aspectRatio: "3/4" }}
              >
                {/* Card Content */}
                <h2 className="text-md text-black font-bold mb-2 text-center">{card.name}</h2>

                <div className="text-center">
                  <div>`IMAGE`</div>
                  <p className="text-black mb-1 text-sm">
                    <strong>Attack:</strong> {card.damage}
                  </p>
                  <p className="text-black mb-1 text-sm">
                    <strong>Defense:</strong> {card.armor}
                  </p>
                  <p className="text-black mb-1 text-sm">
                <strong>Duration:</strong> {card.duration ? card.duration : 0}
                </p>
                </div>
                <p className="text-black text-xs text-center">{card.description}</p>
                </div>
            ))
          }
      </div>

      {/* This section will cover the FIRE button specifically, it could be semi-interactive */}
      <div id='basicMechanics-FIRE' className='flex flex-row p-12'>
        
        <div className='justify-items-center items-center justify-center flex' style={{minWidth: "15%"}}>
          <button
            className='shadow-lg shadow-black h-20 w-20 min-h-20 min-w-20 aspect-square bg-red-600 hover:bg-red-900 border-slate-600 border-2 text-text dark:text-darkText 
            font-bold text-xs sm:text-sm md:text-base lg:text-lg rounded-full justify-center items-center justify-items-center overflow-hidden 
            text-ellipsis focus:ring-4 focus:ring-red-600'
          >
            <GiRocket style={{fontSize: 50, transform: "rotate(270deg)", pointerEvents: "none"}}/>
          </button>
        </div>

        <p className='pl-8'>
          The fire mechanism provides your vessel with two options. If no card is loaded it performs a basic attack for
          five (5) damage; if a card has been loaded, then it will use the damage from that card against your enemy...this
          also includes any effects such as damage over time! Timing is a critical consideration with the fire mechanism,
          just because you have a card loaded does not mean that you have to attack on the next turn! Furthermore, you can
          deploy these cards strategically to slowly diminish your opponent's defenses.
        </p>
      </div>

    </div>
  )

}

export default BasicMechanics;