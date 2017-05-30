import React from 'react'
import ProfileHeader from './ProfileHeader'


export default function App(props) {
  return (
    <div className='profile-page'>
      <div className='profile-header'>
        <ProfileHeader />
      </div>

      <div className='nav-personal-lists'>
        {props.children}
      </div>
    </div>
  )
}
