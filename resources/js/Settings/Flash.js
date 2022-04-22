import React, {useState, useEffect} from 'react';
import EventBus from './Utils/Bus';
import {MdCheckCircle} from 'react-icons/md';

export const Flash = () => {

    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState(false);
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        EventBus.on('success', (data) => {
            setVisibility(true);
            setMessageType('success');
            setMessage(data.message.replace(/"/g, ""));

            setTimeout(() => {
                setVisibility(false);
                setMessage('');
            }, 4000);

        });
    }, []);

    useEffect(() => {
        EventBus.on('error', (data) => {
            setVisibility(true);
            setMessageType('error');
            setMessage(data.message.replace(/"/g, ""));

            setTimeout(() => {
                setVisibility(false);
                setMessage('');
            }, 4000);

        });
    }, []);

    useEffect(() => {
        EventBus.remove("success");
    },[])

    useEffect(() => {
        EventBus.remove("error");
    },[])

    return (
        visibility &&
        <div className={`${visibility && "active "} success_message_wrap`}>
            <div className="display_message alert">
                <p><MdCheckCircle/> { message }!</p>
            </div>
        </div>


    )
}

