import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaderBoard = () => {
  const [users, setUsers] = useState([]);

  // fetch top 10 users
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`/profile/leader-board`);
      console.log('response leaderboard', response);
      // if(response.status !== 200) {
      //   console.error('error getting users for leaderboard');
      // } else {
      //     setUsers(response.data);
      // }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {

    fetchLeaderboard();
  }, []);

  return (
    <div className='bg-slate-900 text-white dark:text-slate-400 dark:bg-black flex flex-col items-center h-full'>
      <h1 className='text-2xl font-bold mb-4'>Leader Board</h1>
      <table className='table-auto border-collapse border border-slate-500'>
        <thead>
          <tr className='bg-slate-700'>
            <th className='border border-slate-600 px-4 py-2'>Rank</th>
            <th className='border border-slate-600 px-4 py-2'>Name</th>
            <th className='border border-slate-600 px-4 py-2'>Score</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any, index) => (
            <tr key={user.name} className='even:bg-slate-800'>
              <td className='border border-slate-600 px-4 py-2'>{index + 1}</td>
              <td className='border border-slate-600 px-4 py-2'>{user.name}</td>
              <td className='border border-slate-600 px-4 py-2'>{user.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderBoard;
