import React, {useEffect, useState} from 'react';
import DateTimePicker from 'react-datetime-picker';
import {BiCalendar} from 'react-icons/bi';

const DateTimeComponent = () => {

    const [value, setValue] = useState(new Date());

    const handleChange = (value) => {

        document.getElementById('date_time').value = Math.round(new Date(value) / 1000);
        setValue(value);
    }

    useEffect(() => {
        document.getElementById('date_time').value = Math.round(new Date(value) / 1000);
    })

    return (
        <div className="date_picker_wrap shadow-sm">
            <DateTimePicker
                onChange={(value) => handleChange(value)}
                value={value}
                minDate={new Date()}
                disableClock={true}
                amPmAriaLabel="Select AM/PM"
                calendarAriaLabel="Toggle Calendar"
                calendarIcon=<BiCalendar />
            />
        </div>
    );
};

export default DateTimeComponent;
