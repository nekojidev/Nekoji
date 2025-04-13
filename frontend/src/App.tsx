import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

const handleClick = () => {
  setCount(count + 1)
}

  return (
<p>hello</p>
  )
}

export default App


