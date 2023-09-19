"use client"

import { NextPage } from "next"
import { useEffect, useState } from "react"


interface DayContent {
  content: string
  startTime: string
  finishTime?: string
  budget?: string
  note?: string
}

class Schedule {
  constructor (
    public title: string,
    public departureDate: Date,
    public returnDate: Date,
    public days: Array<Array<DayContent>>
  ) {}

  static fromJSON(jsonData: string): Schedule {
    const parsedData = JSON.parse(jsonData)
    const tmpDepartureDate = new Date(parsedData.departure_date)
    const tmpReturnDate = new Date(parsedData.return_date)

    return new Schedule(
      parsedData.title,
      tmpDepartureDate,
      tmpReturnDate,
      parsedData.days
    )
  }
}

const Home: NextPage = () => {
  const [day, setDay] = useState<number>(1)
  const [schedule, setSchedule] = useState<Schedule>()
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/schedule.json")
      setSchedule(Schedule.fromJSON(await response.text()))
    }

    fetchData()
  }, [])

  const generateSelectDayBtn = (departureDate: Date, returnDate: Date) => {
    const baseClass = "btn btn-secondary join-item"
    const getClass = (d: number) => {
      if (d != day) {
        return baseClass + " btn-outline"
      }
      return baseClass + ""
    }
    const termDay = ((returnDate.getDate() - departureDate.getDate())) + 1
    const selectDayBtns = []
    for (let d=1; d <= termDay; d++) {
      selectDayBtns.push(
        <button type="button" onClick={() => {setDay(d)}} className={getClass(d)} key={d}>{d}日目</button>
      )
    }

    return (
      <div className="join">{selectDayBtns}</div>
    )
  }

  const getTodaySchedule = (today: number): Array<DayContent> => {
    const todayIndex = today - 1
    if (!schedule?.days[todayIndex]) {
      return []
    }
  
    return schedule.days[todayIndex]
  }

  if (!schedule) {
    return (
      <main>
        <h1>スケジュールをロード中．．．</h1>
      </main>
    )
  }

  return (
    <>
      <header className="navbar justify-center bg-success">
        <div className="navbar-start">
          <h1 className="text-2xl font-bold">{schedule.title}</h1>
        </div>
        <div className="navbar-end">
          <div className="flex">
            <p>{schedule.departureDate.toLocaleDateString()}</p>
            <p className="mx-2">~</p>
            <p>{schedule.returnDate.toLocaleDateString()}</p>
          </div>
        </div>
      </header>
      <main>
        <div className="flex justify-center my-4">
          {generateSelectDayBtn(schedule.departureDate, schedule.returnDate)}
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-center">
                <th>開始</th>
                <th>終了</th>
                <th>内容</th>
                <th>金額</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
            {getTodaySchedule(day).map((dayContent, index) => (
              <tr key={String(index)}>
                <td className="text-center">{dayContent.startTime}</td>
                <td className="text-center">{dayContent?.finishTime}</td>
                <td>{dayContent.content}</td>
                <td className="text-right">{dayContent?.budget}{dayContent.budget && "円"}</td>
                <td>{dayContent?.note}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}

export default Home
