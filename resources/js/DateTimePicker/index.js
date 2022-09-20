import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

if (document.getElementById('date-time-picker')) {

    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('date-time-picker'));

}
