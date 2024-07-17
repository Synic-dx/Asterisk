import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, VStack } from "@chakra-ui/react";

function App() {

  return (
    <ChakraProvider>
      <Router>
          Hello World
      </Router>
    </ChakraProvider>
  )
}

export default App
