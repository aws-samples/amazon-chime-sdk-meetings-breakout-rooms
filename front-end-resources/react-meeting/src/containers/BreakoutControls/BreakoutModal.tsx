// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useContext, ChangeEvent } from 'react';
import {
    Flex,
    Input,
    PrimaryButton,
    Modal,
    FormField,
    ModalHeader,
    ModalBody,
    ModalButton,
    ModalButtonGroup,
  } from 'amazon-chime-sdk-component-library-react';

import { select } from '@storybook/addon-knobs';
import { createMeeting, getBreakouts} from '../../utils/api';
import { getErrorContext } from '../../providers/ErrorProvider';
import { useAppState } from '../../providers/AppStateProvider';

const BreakOutForm: React.FC = () => {
  const {
    region: appRegion,
    meetingId: appMeetingId,
    updateBreakoutRooms: appUpdateBreakoutRooms,
    currentBreakoutIndex: appCurrentBreakoutIndex
  } = useAppState();

  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  const [breakOutCount, setBreakOutCount] = useState('');
  
  const [breakOutCountErr, setBreakOutCountErr] = useState(false);
  const { updateErrorMessage } = useContext(getErrorContext());

  const [region] = useState(appRegion);  
  const [meetingId] = useState(appMeetingId);


  const createBreakOutRooms = async (e: React.FormEvent) => {

    const meetingCount = Number(breakOutCount.trim());

    for (let i=1; i<=meetingCount; i++)
    {
      try{
        const roomIndex = i+appCurrentBreakoutIndex;
        await createMeeting(meetingId, `breakout-${meetingId}-${roomIndex}`, region)
      }
      catch (error) {
        if (error instanceof Error) {
          updateErrorMessage(error.message);
        }
        else {
          throw error;
        }
      }
    }

    const currentBreakoutRooms = await getBreakouts(meetingId);
    appUpdateBreakoutRooms(currentBreakoutRooms);
  };



  return (
    <Flex layout="fill-space-centered">
      <div style={{ width: '12rem', textAlign: 'center' }}>
        <div>
          <PrimaryButton onClick={toggleModal} label="Create Breakout Rooms" />
          {showModal && (
            <Modal
              size={select('size', ['md', 'lg', 'fullscreen'], 'lg')}
              onClose={toggleModal}
              rootId="modal-root"
            >
            <ModalHeader title="Create a Breakout Room" />
  
            <ModalBody>
              <p style={{ margin: '0 0 0.5rem' }}>
              Create this many breakout rooms:
              </p>
              <FormField
                field={Input}
                label="Count"
                value={breakOutCount}
                fieldProps={{
                  name: 'breakOutCount',
                  placeholder: 'Enter # of rooms'
                }}
                errorText="Please enter a valid number"
                error={breakOutCountErr}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setBreakOutCount(e.target.value);
                  if (breakOutCountErr) {
                    setBreakOutCountErr(false);
                  }
                }}
                />
                </ModalBody>
                <ModalButtonGroup
                  primaryButtons={[
                    <ModalButton
                      onClick={createBreakOutRooms}
                      variant="primary"
                      label="Create"
                      closesModal
                    />
                  ]}
                />
              </Modal>
            )}
          </div>
        </div>
      </Flex>
    );
  };

  export default BreakOutForm;