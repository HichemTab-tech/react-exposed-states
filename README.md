# react-exposed-states

A lightweight utility that lets you expose React state values to the browser window. Perfect for debugging and quick runtime tweaks during development.

---

## 🚀 Getting Started

Start by installing the package via your preferred package manager:

```sh
npm install react-exposed-states
```

or, if using pnpm:

```sh
pnpm add react-exposed-states
```

---

## 📖 Usage

Here's how to use the `expose` hook to make your React state accessible from the browser console:

```javascript
import React, { useState } from 'react';
import { expose } from 'react-exposed-states';

function MyComponent() {
  const [counter, setCounter] = expose(useState(0), 'myCounter');
  
  return (
    <div>
      <p>Counter: {counter}</p>
      <button onClick={() => setCounter(counter + 1)}>
        Increment
      </button>
    </div>
  );
}
```

After rendering this component, you can access and modify the state from the browser console:

```javascript
// Check the current state
console.log(window.exposed.get('myCounter').state); // 0

// Update the state programmatically
window.exposed.get('myCounter').setState(42);

// Subscribe to state changes
window.exposed.get('myCounter').subscribe((newValue) => {
  console.log('State changed to:', newValue);
});
```

---

## ⚙️ API Reference

### 🚩 **Hook `expose<T>(useStateReturn, uniqueName?)`**

A React hook that wraps a useState return value and exposes the state to `window.exposed` for debugging and runtime manipulation.

**Parameters:**

| Parameter       | Type                                    | Description                                                |
|-----------------|----------------------------------------|------------------------------------------------------------|
| `useStateReturn` | `[T, Dispatch<SetStateAction<T>>]`     | The return value from React's useState hook               |
| `uniqueName`    | `string` (optional)                    | A unique name for the exposed state. If not provided, uses React's useId() |

**Returns:**

- Type: `[T, Dispatch<SetStateAction<T>>]`
Returns the same state and setState function as useState, but with enhanced setState that updates both React state and the exposed state.

**Exposed State Object:**

The exposed state object available at `window.exposed.get(uniqueName)` contains:

- `state`: The current state value
- `setState(value)`: Function to update the state
- `subscribe(callback)`: Function to listen to state changes
- `unsubscribe(callback)`: Function to stop listening to state changes

**Example:**

```javascript
import React, { useState } from 'react';
import { expose } from 'react-exposed-states';

function App() {
  // Basic usage with auto-generated name
  const [count, setCount] = expose(useState(0));
  
  // Usage with custom name
  const [user, setUser] = expose(useState({ name: 'John' }), 'currentUser');
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>User: {user.name}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Access from browser console:
// window.exposed.get('currentUser').state.name // "John"
// window.exposed.get('currentUser').setState({ name: 'Jane' })
```

---

## 🤝 Contributions

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow existing coding styles and clearly state your changes in the pull request.

---

## 🐞 Issues

If you encounter any issue, please open an issue [here](https://github.com/HichemTab-tech/react-exposed-states/issues).

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) file for more details.

&copy; 2025 [Hichem Taboukouyout](mailto:hichem.taboukouyout@hichemtab-tech.me)

---

## ⭐️ Support

If you found this package helpful, consider leaving a star! ⭐️

---

## 📣 Acknowledgments

Acknowledgments and thanks to:

- Mention any useful inspiration, references, or external resources here if applicable.