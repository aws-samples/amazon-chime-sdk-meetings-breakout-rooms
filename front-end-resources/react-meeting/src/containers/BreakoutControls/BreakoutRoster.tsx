// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect }  from 'react';
import "@reach/menu-button/styles.css";
import {
  Roster,
  RosterCell,
  RosterHeader,
  RosterGroup
} from 'amazon-chime-sdk-component-library-react';
import { useNavigation } from '../../providers/NavigationProvider';
import { useAppState } from '../../providers/AppStateProvider';

import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';

import { getBreakouts } from '../../utils/api';

const BreakoutRoster = () => {
  
  const meetingManager = useMeetingManager();

  const {
    meetingId: appMeetingId,
    breakoutRooms: appBreakoutRooms,
    isBreakout: appIsBreakout,
    localUserName : appLocalUserName,
    mainMeetingId : appMainMeetingId,
    updateBreakoutRooms : appUpdateBreakoutRooms
  } = useAppState();  

  const { closeBreakout } = useNavigation();

  useEffect(() => {
    console.log('>>>>>>>loaded')

    //load breakout rooms
    getBreakouts(appIsBreakout? appMainMeetingId:appMeetingId).then(currentBreakoutRooms => {
      appUpdateBreakoutRooms(currentBreakoutRooms);
    })

  }, [appIsBreakout, appMainMeetingId, appMeetingId, appUpdateBreakoutRooms]);
  
  const joinMeeting = async (meetingTitle: string, isBreakout=false) => {
    console.log(`joining meeting: ${meetingTitle}`);

    let hrefLocation = ''

    if(isBreakout)
    {
      hrefLocation = `${window.location.protocol}//${window.location.host}/joinbreakout/${appIsBreakout? appMainMeetingId : appMeetingId}/${meetingTitle}/${appLocalUserName}`
    }
    else{
      hrefLocation = `${window.location.protocol}//${window.location.host}/join/${meetingTitle}/${appLocalUserName}`
    }

    if(meetingManager.meetingSession){
      console.log('BreakoutRoster >> Leaving the meeting');
      meetingManager.leave();
    }
    
    window.location.href=hrefLocation

    

  }

  const makeComparator = (key, order='asc') =>{
    return (a, b) => {
        if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0; 
    
        const aVal = ((typeof a[key] === 'string') ? a[key].toUpperCase() : a[key]);
        const bVal = ((typeof b[key] === 'string') ? b[key].toUpperCase() : b[key]);
    
        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        if (aVal < bVal) comparison = -1;

        return order === 'desc' ? (comparison * -1) : comparison
    };
}

  return (
    <Roster className="roster">
      <RosterHeader
        onClose={closeBreakout}
        title="Meetings"
      />
      
        {appIsBreakout&&
        <RosterGroup title={`Main meeting:`}>
        <RosterCell key={`main-${appMainMeetingId}`} name={appMainMeetingId} menu={
          <div style={{ padding: '.5rem 1rem', cursor: 'pointer' }} onClick={()=>joinMeeting(appMainMeetingId, false)}>Join meeting</div>
        } />
        </RosterGroup>}
        
        {appBreakoutRooms.length>0 &&
        <RosterGroup title={`Breakout rooms:`} badge={appBreakoutRooms.length}>
        {appBreakoutRooms.sort(makeComparator('Title')).map((broom: any)=>{
          return(
              <RosterCell 
                key={`breakout-${broom.Title}`} 
                name={broom.Title} 
                menu={<>
                  <div style={{ padding: '.5rem 1rem', cursor: 'pointer' }} onClick={()=>joinMeeting(broom.Title, true)}>Join Room</div>
              </>} />
            )
        })}
        </RosterGroup>}
    </Roster>
  );
};

export default BreakoutRoster;
