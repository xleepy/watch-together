import { Route, Routes } from "react-router"
import { Room } from "./components/room"
import { CreateRoom } from "./components/create-room"

export const AppRoutes = () => {
  return <Routes>
    <Route path="/" element={<CreateRoom />} />
    <Route path="/room/:roomId" element={<Room />} />
  </Routes>
}