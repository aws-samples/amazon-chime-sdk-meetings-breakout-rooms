// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useState, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  meetingId: string;
  localUserName: string;
  theme: string;
  region: string;
  breakoutRooms: any;
  currentBreakoutIndex: number;
  isBreakout: boolean;
  mainMeetingId: string,
  toggleTheme: () => void;
  setAppMeetingInfo: (meetingId: string, name: string, region: string, breakoutRooms: any) => void,
  updateBreakoutRooms: (breakoutRooms: Array<any>) => void;
  setIsBreakout: (value: boolean) => void;
  setMainMeetingId: (value: string) => void;
}



const AppStateContext = React.createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return state;
}

const query = new URLSearchParams(window.location.search);

export function AppStateProvider({ children }: Props) {
  const [meetingId, setMeeting] = useState(query.get('meetingId') || '');

  const [breakoutRooms, setBreakoutRooms] = useState([] as any);
  
  const [region, setRegion] = useState(query.get('region') || '');
  const [localUserName, setLocalName] = useState('');
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });
  const [currentBreakoutIndex, setCurrentBreakoutIndex] = useState(0);
  const [isBreakout, setIsBreakout] = useState(false);

  const [mainMeetingId, setMainMeetingId] = useState('')

  const toggleTheme = (): void => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const updateBreakoutRooms = (breakoutRooms: Array<any>): void =>{
    setCurrentBreakoutIndex(breakoutRooms.length); 
    setBreakoutRooms(breakoutRooms);
  }

  const setAppMeetingInfo = (
    meetingId: string,
    name: string,
    region: string,
    breakoutRooms: any
  ) => {
    setRegion(region);
    setMeeting(meetingId);
    setLocalName(name);
    updateBreakoutRooms(breakoutRooms);
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    region,
    breakoutRooms,
    currentBreakoutIndex,
    isBreakout,
    mainMeetingId,
    toggleTheme,
    setAppMeetingInfo,
    updateBreakoutRooms,
    setIsBreakout,
    setMainMeetingId
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}
