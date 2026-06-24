import { Button } from '@govtechmy/myds-react/button'
import { Input } from '@govtechmy/myds-react/input'
import { Spinner } from '@govtechmy/myds-react/spinner'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth.svc'
import LockIcon from '@/assets/Icons/LockIcon'
import { Eye, EyeOff } from '@/assets/Icons/Eye'
import { CheckCircleIcon } from '@govtechmy/myds-react/icon'
import Mask from '@/assets/bg-svg/Mask'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>(' ')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const HARD_CODED_USERNAME = 'admin@gmail.com'
  const HARD_CODED_PASSWORD = 'ChangeThisPassword123!'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(' ')
    setIsLoading(true)

    try {
      await login({ username: username, password: password })
      const lang = localStorage.getItem('lang') ?? 'ms'
      navigate(`/${lang}/`)
    } catch (error) {
      setIsLoading(false)
      setError('Gagal log masuk. Sila semak Nombor IC dan kata laluan.')
      console.error('Login error:', error)
    }
  }

  const handleHardcodedLogin = async () => {
    setError(' ')
    setIsLoading(true)
    setUsername(HARD_CODED_USERNAME)
    setPassword(HARD_CODED_PASSWORD)

    try {
      await login({ username: HARD_CODED_USERNAME, password: HARD_CODED_PASSWORD })
      const lang = localStorage.getItem('lang') ?? 'ms'
      navigate(`/${lang}/`)
    } catch (error) {
      setIsLoading(false)
      setError('Gagal log masuk. Sila semak Nombor IC dan kata laluan.')
      console.error('Hardcoded login error:', error)
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative flex w-full min-h-screen px-[24px] lg:px-[36px] py-[32px] pb-[96px] overflow-hidden bg-[radial-gradient(ellipse_5000px_3000px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)]">
        <Mask className="absolute inset-0 xl:w-full h-2/3 pointer-events-none" />
        <div className="flex max-lg:flex-col items-center justify-center gap-12 w-full z-10">
          <div className="w-full lg:max-w-[600px] flex flex-col gap-6">
            <div className="w-full flex justify-center lg:justify-start">
              <img
                className="w-[103.4483px] h-[80.6897px] max-sm:w-[65.9px] max-sm:h-[51.6px]"
                src="/jata-negara.png"
                alt="Jata Negara"
              />
            </div>

            <div className="text-center font-body font-semibold tracking-[4px] lg:text-start text-primary-700 max-sm:text-sm">
              SELAMAT DATANG
            </div>
            <h1 className="text-heading-md text-center lg:text-start font-heading font-semibold max-sm:text-heading-sm">
              GOVSuiteDMS
            </h1>
            <div className="flex flex-col text-body-md text-center lg:text-start text-txt-black-700 font-body gap-2 max-sm:px-0 max-lg:px-16  max-sm:text-body-sm">
              <p>
                Pusat rujukan digital bagi pengurusan, capaian, dan analisis rekod strategik negara
                secara efisien dan selamat.
              </p>
            </div>
            <div className="flex max-lg:justify-center max-lg:items-center max-sm:text-body-sm">
              <div className="flex flex-col">
                <div className="flex gap-2 items-center p-2 pb-0 font-body">
                  <CheckCircleIcon className="text-txt-success shrink-0" />
                  <div>
                    <p className="text-body-sm text-txt-black-700">Satu Carian, Semua Dokumen</p>
                  </div>
                </div>
                <p className="pl-9 text-body-md font-light text-txt-black-500">
                  Akses menyeluruh kepada pelbagai jenis rekod
                </p>
                <div className="flex gap-2 items-center p-2 pb-0 font-body">
                  <CheckCircleIcon className="text-txt-success shrink-0" />
                  <div>
                    <p className="text-body-sm text-txt-black-700">Navigasi Dashboard</p>
                  </div>
                </div>
                <p className="pl-9 text-body-md font-light text-txt-black-500">Paparan analitik</p>
                <div className="flex gap-2 items-center p-2 pb-0 font-body">
                  <CheckCircleIcon className="text-txt-success shrink-0" />
                  <div>
                    <p className="text-body-sm text-txt-black-700">Capaian Pantas</p>
                  </div>
                </div>
                <p className="pl-9 text-body-md font-light text-txt-black-500">
                  Arkib digital di hujung jari
                </p>
              </div>
            </div>
          </div>

          <LoginUi
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            error={error}
            handleLogin={handleLogin}
            handleHardcodedLogin={handleHardcodedLogin}
          />
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 w-full -translate-x-1/2 px-6 text-center text-body-xs text-txt-black-500 font-body">
        Sistem ini hanya untuk kegunaan rasmi kerajaan. Sila pastikan kerahsiaan data terpelihara.
      </div>
    </div>
  )
}

interface LoginUiProps {
  username: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
  password: string
  setPassword: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  error: string
  handleLogin: (e: React.FormEvent) => void
  handleHardcodedLogin: () => void
}

function LoginUi({
  username,
  setUsername,
  password,
  setPassword,
  isLoading,
  error,
  handleLogin,
  handleHardcodedLogin,
}: LoginUiProps) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="max-w-[457px] w-full z-10 border border-otl-gray-200 p-8 rounded-lg shadow-card bg-bg-white">
      <div className="flex gap-3 items-center pb-6 justify-center">
        <LockIcon />
        <div className="font-body font-semibold text-body-lg">Log Masuk</div>
        <button
          type="button"
          onClick={handleHardcodedLogin}
          disabled={isLoading}
          className="rounded-md border border-otl-gray-200 px-3 py-1 text-body-sm font-medium text-primary-700 hover:bg-bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Developer Login
        </button>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-1.5">
            <div className="text-txt-black-700 text-body-md font-medium">ID Pengguna</div>
            {/* <div className="text-txt-black-500 text-body-sm font-normal">
              Sila masukkan no kad pengenalan tanpa tanda '-'
            </div> */}
            <Input
              id="username"
              type="string"
              placeholder="admin@admin.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex w-full flex-col gap-1.5">
            <div className="text-txt-black-700 text-body-md font-medium">Kata Laluan</div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata laluan anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className=""
              >
                <button
                  type="button"
                  aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Papar kata laluan'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-black-400 hover:text-txt-black-700 focus:outline-none"
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </Input>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary-fill"
            className="w-full items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="w-5 h-5 mr-2" />
                Log Masuk...
              </>
            ) : (
              'Log Masuk'
            )}
          </Button>

          {error && error.trim() && (
            <p className="text-txt-danger text-body-sm text-center">{error}</p>
          )}
        </div>
      </form>
    </div>
  )
}
