// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots
} from 'amazon-chime-sdk-component-library-react';
import BreakoutModal from '../BreakoutControls/BreakoutModal';
import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';

import { useAppState } from '../../providers/AppStateProvider';

const MeetingControls = () => {
  const { toggleNavbar, closeRoster, showRoster, closeBreakout, showBreakout} = useNavigation();
  const { isUserActive } = useUserActivityState();

  const {isBreakout} = useAppState();

  const handleToggle = () => {
    if (showRoster) {
      closeRoster();
    }

    if (showBreakout) {
      closeBreakout();
    }

    toggleNavbar();
  };

  return (
    <StyledControls className="controls" active={!!isUserActive}>
      <ControlBar
        className="controls-menu"
        layout="undocked-horizontal"
        showLabels
      >
        <ControlBarButton
          className="mobile-toggle"
          icon={<Dots />}
          onClick={handleToggle}
          label="Menu"
        />
        <AudioInputControl />
        <VideoInputControl />
        <ContentShareControl />
        <AudioOutputControl />
        <EndMeetingControl />
        {}
        { !isBreakout && <BreakoutModal /> }
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
