import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const CONTRACT_ADDRESS = "0x051aD0a5E571470d9406d4920B385717077B46bD";

function App() {
  const [account, setAccount] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskText, setTaskText] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchTasks();
        }
      });
    }
  }, []);

  async function connectWallet() {
    if (window.ethereum && !isConnecting) {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        fetchTasks();
      } catch (error) {
        console.error("Error connecting wallet:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask is required!");
    }
  }

  async function fetchTasks() {
    if (!account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const myTasks = await contract.getMyTask();
      setTasks(myTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function addTask() {
    if (!taskTitle || !taskText) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.addTask(taskText, taskTitle, false);
      await tx.wait();
      setTaskTitle("");
      setTaskText("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async function deleteTask(taskId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  return (
    <div className="container">
      <h1>Task Manager</h1>
      <button onClick={connectWallet} disabled={isConnecting}>
        {account ? `Connected: ${account}` : "Connect Wallet"}
      </button>
      <div>
        <input
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <h2>My Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.taskTitle}: {task.taskText}</span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;