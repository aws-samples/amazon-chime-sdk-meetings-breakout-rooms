// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef } from 'react';
import { useLocalAudioInputActivityPreview } from 'amazon-chime-sdk-component-library-react';

import ActivityBar from '../../ActivityBar';

const MicrophoneActivityPreviewBar = () => {
  const activityBarRef = useRef<HTMLDivElement>(null);
  useLocalAudioInputActivityPreview(activityBarRef);

  return <ActivityBar ref={activityBarRef} />;
};

export default MicrophoneActivityPreviewBar;
