import * as React from 'react';
import {expose} from 'react-exposed-states';
import {useState} from "react";

const App = () => {

    const [counter, setCounter] = expose(useState(0));

    return (
        <div>
            <h1 className="text-red-600">react-exposed-states Demo</h1>
            <button onClick={() => setCounter(counter + 1)}>Increment Counter ({counter})</button>
        </div>
    );
};

export default App;