import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import './App.css';

const firebaseConfig = {
    apiKey: 'AIzaSyCjDTYvlmZiyIbCgALHLAs4nh1QG6JFR8c',
    authDomain: 'todo-app-bf655.firebaseapp.com',
    projectId: 'todo-app-bf655',
    storageBucket: 'todo-app-bf655.appspot.com',
    messagingSenderId: '824610478457',
    appId: '1:824610478457:web:3485c0a9fb43b72a95b7a8',
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const App = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dbGet = await db.collection('todos').get();
                const data = dbGet.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTodos(data);
                localStorage.setItem('todos', JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching data: ', error);
                const savedTodos =
                    JSON.parse(localStorage.getItem('todos')) || [];
                setTodos(savedTodos);
            }
        };

        fetchData();
    }, []);

    const addTodo = async () => {
        try {
            const todo = { text: newTodo, completed: false };
            const docRef = await db.collection('todos').add(todo);
            const updatedTodos = [...todos, { id: docRef.id, ...todo }];
            setTodos(updatedTodos);
            setNewTodo('');
            localStorage.setItem('todos', JSON.stringify(updatedTodos));
        } catch (error) {
            console.error('Error adding todo: ', error);
        }
    };
    const toggleTodo = async (id) => {
        const updatedTodos = todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );

        try {
            await db
                .collection('todos')
                .doc(id)
                .update({
                    completed: updatedTodos.find((todo) => todo.id === id)
                        .completed,
                });
            setTodos(updatedTodos);
            localStorage.setItem('todos', JSON.stringify(updatedTodos));
        } catch (error) {
            console.error('Error updating todo: ', error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await db.collection('todos').doc(id).delete();
            const updatedTodos = todos.filter((todo) => todo.id !== id);
            setTodos(updatedTodos);
            localStorage.setItem('todos', JSON.stringify(updatedTodos));
        } catch (error) {
            console.error('Error deleting todo: ', error);
        }
    };

    return (
        <div className="App">
            <h1>Todo App</h1>
            <input
                type="text"
                placeholder="Add a new todo"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
            />
            <button onClick={addTodo}>Add Todo</button>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span
                            style={{
                                textDecoration: todo.completed
                                    ? 'line-through'
                                    : 'none',
                            }}
                        >
                            {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
