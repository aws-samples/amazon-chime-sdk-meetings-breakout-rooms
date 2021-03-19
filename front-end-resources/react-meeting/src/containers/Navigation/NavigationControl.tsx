// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import MeetingRoster from '../MeetingRoster';
import Navigation from '.';
import BreakoutRoster from '../BreakoutControls/BreakoutRoster';
import { useNavigation } from '../../providers/NavigationProvider';

const NavigationControl = () => {
  const { showNavbar, showRoster, showBreakout } = useNavigation();

  return (
    <>
      {showBreakout ? <BreakoutRoster /> : null }  
      {showNavbar ? <Navigation /> : null}
      {showRoster ? <MeetingRoster /> : null}
    </>
  );
};

export default NavigationControl;
