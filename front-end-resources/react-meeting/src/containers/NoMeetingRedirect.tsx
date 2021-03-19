// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  useMeetingManager,
  useNotificationDispatch,
  Severity,
  ActionType,
} from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';

const NoMeetingRedirect: React.FC = ({ children }) => {
  const history = useHistory();
  const dispatch = useNotificationDispatch();
  const meetingManager = useMeetingManager();

  

  useEffect(() => {
    const payload: any = {
      severity: Severity.INFO,
      message: 'No meeting found, please enter a valid meeting Id',
      autoClose: true,
    };

    if (!meetingManager.meetingSession) {
      dispatch({
        type: ActionType.ADD,
        payload: payload,
      });
      history.push(routes.HOME);
    }
  }, [dispatch, history, meetingManager.meetingSession]);

  return <>{children}</>;
};

export default NoMeetingRedirect;
