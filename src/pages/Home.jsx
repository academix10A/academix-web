import Navbar from '../components/Navbar.jsx'
import Carousel from '../components/Carousel.jsx'
import Memberships from '../components/Memberships.jsx'
import AboutUs from '../components/Aboutus.jsx'
import NoteWidget from '../components/NoteWidget.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Carousel />
        <Memberships />
        <AboutUs />
      </main>
      <Footer />
      <NoteWidget />
    </>
  )
}