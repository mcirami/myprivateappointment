import React, {useEffect, useState} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {BiCalendar} from 'react-icons/bi';

const DateTimeComponent = () => {

    const [value, setValue] = useState(new Date());

    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);

        return currentDate.getTime() < selectedDate.getTime();
    };

    const handleChange = (value) => {
        document.getElementById('date_time').value = Math.round(new Date(value) / 1000);
        setValue(value);
    }

    useEffect(() => {
        document.getElementById('date_time').value = Math.round(new Date(value) / 1000);
    })

    return (
        <div className="date_picker_wrap shadow-sm">
            <DatePicker
                selected={value}
                onChange={(value) => handleChange(value)}
                showTimeSelect
                filterTime={filterPassedTime}
                minDate={new Date()}
                dateFormat="MMMM d, yyyy h:mm aa"
            />
        </div>
    );
};

export default DateTimeComponent;
