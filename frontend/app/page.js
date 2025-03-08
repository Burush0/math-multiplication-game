'use client'

import React, { useEffect, useState } from 'react'

function index() {

  const [message, setMessage] = useState("Loading");
  const [people, setPeople] = useState([]);
  const [response, setResponse] = useState(null);

  const handleClick = async () => {
    const data = { message: "Hello from React!" };

    try {
      const response = await fetch("http://localhost:8080/api/submit", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setPeople(data.people);
      });
  }, []);

  return (
    <div>
      <button onClick={handleClick}>
        Send Data to Server
      </button>
      {response && <p>
        Server Response: {JSON.stringify(response)}
        </p>}
      <div>{message}</div>

      {people.map((person, index) => (
        <div key={index}>{person}</div>
      ))}
    </div>
  );
}

export default index
