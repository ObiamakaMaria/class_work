import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json"
import "./index.css"



const contractAddress = "0x9a3faF3fd0764C6d3Ec5A40b2a302220494582dc";

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskText, setTaskText] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        connectWallet();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            setProvider(provider);
            setContract(contract);
            setIsConnected(true);
            fetchTasks();
        } else {
            alert("MetaMask is required to use this app.");
        }
    };

    const fetchTasks = async () => {
        if (contract) {
            try {
                const tasks = await contract.getMyTask();
                setTasks(tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        }
    };

    const addTask = async () => {
        if (contract) {
            try {
                const tx = await contract.addTask(taskText, taskTitle, false);
                await tx.wait();
                fetchTasks();
            } catch (error) {
                console.error("Error adding task:", error);
            }
        }
    };

    const deleteTask = async (taskId) => {
        if (contract) {
            try {
                const tx = await contract.deleteTask(taskId);
                await tx.wait();
                fetchTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    return (
      <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Manager</h1>
  
      {!isConnected ? (
          <button 
              onClick={connectWallet}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
              Connect Wallet
          </button>
      ) : (
          <>
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <input
                      type="text"
                      placeholder="Task Title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                      type="text"
                      placeholder="Task Text"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                      onClick={addTask}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                  >
                      Add Task
                  </button>
              </div>
  
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">My Tasks</h2>
  
              <ul className="w-full max-w-lg space-y-4">
                  {tasks.map((task, index) => (
                      <li key={index} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                              <strong>{task.taskTitle}</strong>: {task.taskText}
                          </span>
                          {!task.isDeleted && (
                              <button
                                  onClick={() => deleteTask(task.id)}
                                  className="text-red-500 hover:text-red-700 transition"
                              >
                                  Delete
                              </button>
                          )}
                      </li>
                  ))}
              </ul>
          </>
      )}
  </div>
  
    );
};

export default TaskManager;