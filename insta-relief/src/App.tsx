// src/App.tsx
import React, { useEffect, useState } from 'react'; 
import { db } from './firebase'; 
import { collection, addDoc, getDocs } from "firebase/firestore";


interface Policy {
  zip_code: string;
  phone_number: string;
  status: string;
}

function App(): React.JSX.Element { 

  const [policies, setPolicies] = useState<Policy[]>([]); 

  const addPolicy = async () => {
    try {
      const docRef = await addDoc(collection(db, "policies"), {
        zip_code: "70112",
        phone_number: "+15551234567",
        status: "active"
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    const fetchPolicies = async () => {
      const querySnapshot = await getDocs(collection(db, "policies"));
      
      const policiesList = querySnapshot.docs.map(doc => doc.data() as Policy);
      
      setPolicies(policiesList);
    };
    fetchPolicies();
  }, []);

  return (
    
    <div>
      <button onClick={addPolicy}>Add Test Policy</button>
      
      <h3>Current Policies:</h3>
      <ul>
        {policies.map((policy, index) => (
          <li key={index}>
            {policy.zip_code}: {policy.phone_number} ({policy.status})
          </li>
        ))}
      </ul>
    </div>
     
     
  );
}

export default App;