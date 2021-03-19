// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppState } from '../providers/AppStateProvider';

import routes from '../constants/routes';

interface Props {
  meetingId: string
  isBreakout: boolean,
  mainMeetingId? : string
  name? : string
}

const JoinMeetingRedirect: React.FC<Props> = ({ meetingId, mainMeetingId='', name='', isBreakout=false, children }) => {
  const history = useHistory();

  const {setAppMeetingInfo, setIsBreakout, setMainMeetingId} = useAppState();

  useEffect(() => {
    setAppMeetingInfo(meetingId, name ,'', {});
    setIsBreakout(isBreakout);
    if(isBreakout) setMainMeetingId(mainMeetingId);
    history.push(routes.HOME);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export default JoinMeetingRedirect;