import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import './App.css'

const DashboardContext = createContext(null)
const ITEMS_PER_PAGE = 6

function DashboardProvider({ children }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load users right now.')
        }

        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Something went wrong while loading users.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadUsers()

    return () => controller.abort()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const nextUsers = users.filter((user) => user.name.toLowerCase().includes(query))

    nextUsers.sort((firstUser, secondUser) => {
      const result = firstUser.name.localeCompare(secondUser.name)
      return sortOrder === 'asc' ? result : -result
    })

    return nextUsers
  }, [searchTerm, sortOrder, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const visiblePage = Math.min(currentPage, totalPages)

  const currentUsers = filteredUsers.slice(
    (visiblePage - 1) * ITEMS_PER_PAGE,
    visiblePage * ITEMS_PER_PAGE,
  )

  const selectedUserById = (id) => users.find((user) => String(user.id) === String(id))

  const value = {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    currentPage: visiblePage,
    setCurrentPage,
    totalPages,
    currentUsers,
    filteredUsers,
    selectedUserById,
    theme,
    setTheme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

function getUserIdFromPath(pathname) {
  const match = pathname.match(/^\/users\/(\d+)\/?$/)
  return match ? match[1] : null
}

function useAppRoute() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath) => {
    if (nextPath === window.location.pathname) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
  }

  return {
    navigate,
    pathname,
    userId: getUserIdFromPath(pathname),
  }
}

function useDashboard() {
  const context = useContext(DashboardContext)

  if (!context) {
    throw new Error('useDashboard must be used inside DashboardProvider')
  }

  return context
}

function AppShell() {
  const { theme } = useDashboard()
  const { navigate, userId } = useAppRoute()

  return (
    <div className={`app-shell ${theme}`}>
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />

      {userId ? <UserDetailPage userId={userId} onBack={() => navigate('/')} /> : <HomePage onOpenUser={(id) => navigate(`/users/${id}`)} />}
    </div>
  )
}

function App() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  )
}

function HomePage({ onOpenUser }) {
  const {
    currentPage,
    currentUsers,
    error,
    loading,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    setSortOrder,
    sortOrder,
    theme,
    toggleTheme,
    totalPages,
  } = useDashboard()

  return (
    <main className="page page--home">
      <header className="brandbar panel">
        <a className="brand" href="/" aria-label="PeopleAtlas home">
          <span>People</span>
          <strong>Atlas</strong>
        </a>

        <button type="button" className="theme-toggle theme-toggle--small" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <section className="panel directory-shell">
        <div className="directory-heading">
          <h1>Directory</h1>
          <p>Search and sort persist while you browse a profile (session).</p>
        </div>

        <div className="controls-row">
          <label className="field field--search">
            <span>Search by name</span>
            <div className="input-wrap">
              <input
                type="search"
                placeholder="Search users"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setCurrentPage(1)
                }}
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="input-clear"
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </div>
          </label>

          <label className="field field--sort">
            <span>Sort</span>
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="asc">Name A → Z</option>
              <option value="desc">Name Z → A</option>
            </select>
          </label>
        </div>

        {loading ? (
          <section className="state-panel state-panel--inline">
            <div className="loader" aria-hidden="true" />
            <h2>Loading users</h2>
          </section>
        ) : error ? (
          <section className="state-panel state-panel--inline error-state">
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </section>
        ) : currentUsers.length === 0 ? (
          <section className="state-panel state-panel--inline">
            <h2>No users found</h2>
          </section>
        ) : (
          <section className="directory-list" aria-label="Users">
            {currentUsers.map((user) => (
              <button key={user.id} type="button" className="user-row" onClick={() => onOpenUser(user.id)}>
                <div className="user-row__main">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="user-row__meta">
                  <span>{user.address.city}</span>
                </div>
              </button>
            ))}
          </section>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

        {/* <footer className="page-footer">Assignment 3 — JSONPlaceholder users</footer> */}
      </section>
    </main>
  )
}

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}>
        Previous
      </button>

      <div className="pagination__info">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </div>

      <button type="button" onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}>
        Next
      </button>
    </nav>
  )
}

function UserDetailPage({ userId, onBack }) {
  const { error, loading, selectedUserById } = useDashboard()
  const user = selectedUserById(userId)
  const websiteHref = user?.website
    ? /^https?:\/\//i.test(user.website)
      ? user.website
      : `https://${user.website}`
    : ''

  return (
    <main className="page page--detail detail-page detail-page--centered">
      <button type="button" className="back-link" onClick={onBack}>
        ← Go back
      </button>

      {loading ? (
        <section className="panel state-panel state-panel--inline">
          <div className="loader" aria-hidden="true" />
          <h2>Loading profile</h2>
          <p>Please wait while the user data is prepared.</p>
        </section>
      ) : error ? (
        <section className="panel state-panel state-panel--inline error-state">
          <h2>Unable to show this profile</h2>
          <p>{error}</p>
        </section>
      ) : !user ? (
        <section className="panel state-panel state-panel--inline">
          <h2>User not found</h2>
          <p>The selected profile does not exist.</p>
        </section>
      ) : (
        <section className="panel detail-card">
          <div className="detail-card__hero">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span>Phone</span>
              <strong>{user.phone}</strong>
            </div>
            <div className="detail-item">
              <span>City</span>
              <strong>{user.address.city}</strong>
            </div>
            <div className="detail-item">
              <span>Company</span>
              <strong>{user.company.name}</strong>
            </div>
            <div className="detail-item">
              <span>Website</span>
              <strong>
                <a href={websiteHref} target="_blank" rel="noreferrer noopener">
                  {user.website}
                </a>
              </strong>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
