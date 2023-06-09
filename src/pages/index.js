import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import * as Papa from 'papaparse';
import { StatsGroup } from '@/components/Stat'
import { createStyles } from '@mantine/core';
import SalaryHistogram from '@/components/Histogram';
import SalaryTable from '@/components/Table';
import { Select } from '@mantine/core';

const inter = Inter({ subsets: ['latin'] })

const cleanNum = (val) => {
  if (!Number.isInteger(val)) {
    return parseFloat(val.replace(/,/g, ''))
  }
  return val
}

const useStyles = createStyles((theme) => ({
  pageContainer: {
    padding: '2rem',
    maxWidth: '80vw',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  pageHeader: {
    textAlign: 'center',
    fontSize: '32px'
  },
  filterRow: {
    paddingBottom: '35px',
    display: 'flex',
    justifyContent: 'between'
  },
  filterItem: {
    width: '50%',
    paddingRight: '10px'
  },
  statsRow: {
    paddingBottom: '35px'
  },
  chartRow: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: "center"
  },
  tableRow: {
    paddingTop: '20px'
  }
}));

function calcMed(data) {
  const length = data.length
  if (length === 0) {
    return "No Data"
  }

  let med;
  if (length % 2 == 0) {
    med = (data[Math.floor(length / 2)]["SY2122"] + data[Math.floor(length / 2) - 1]["SY2122"]) / parseFloat(2)
  } else {
    med = data[Math.floor(length / 2)]["SY2122"]
  }
  return med.toLocaleString(undefined, { style: 'currency', currency: "USD", maximumFractionDigits: 0, currencyDisplay: "symbol" })
}

function calcAvg(data) {
  if (data.length === 0) {
    return "No Data"
  }
  let total = 0
  data.forEach((row) => {
    total += parseFloat(row["SY2122"])
  })
  return (total / parseFloat(data.length)).toLocaleString(undefined, { style: 'currency', currency: "USD", maximumFractionDigits: 0, currencyDisplay: "symbol" })
}

function calcStd(data) {
  if (data.length === 0) {
    return "No Data"
  }
  let total = 0
  data.forEach((row) => {
    total += parseFloat(row["SY2122"])
  })
  let avg = total / parseFloat(data.length)
  total = 0
  data.forEach((row) => {
    total += Math.pow(parseFloat(row["SY2122"]) - avg, 2)
  })
  return Math.sqrt(total / parseFloat(data.length)).toLocaleString(undefined, { style: 'currency', currency: "USD", maximumFractionDigits: 0, currencyDisplay: "symbol" })
}

export default function Home() {
  const [salaryData, setSalaryData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [titles, setTitles] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState(null)
  const styles = useStyles()
  useEffect(() => {
    const loadEmploymentData = () => {
      fetch('./K12AllStaffSalaryData.csv')
        .then(response => response.text())
        .then(responseText => {
          const parsed = Papa.parse(responseText, { header: true, dynamicTyping: true });
          const cleanedData = []
          const cleanedDistricts = []
          const cleanedTitles = []
          parsed.data.forEach((row) => {
            const cleanedTitle = row["Duty"].trim()
            const cleanedDistrict = row["DistrictName"].trim()

            if (!cleanedDistricts.includes(cleanedDistrict)) {
              cleanedDistricts.push(cleanedDistrict)
            }
            if (!cleanedTitles.includes(cleanedTitle)) {
              cleanedTitles.push(cleanedTitle)
            }

            const cleanedRow = {
              DistrictName: cleanedDistrict,
              Name: row["Name"].trim(),
              Duty: cleanedTitle,
              SY2122: cleanNum(row["SY2021-22"]),
            }
            if (!isNaN(cleanedRow["SY2122"])) {
              cleanedData.push(cleanedRow)
            }
          })
          const districtObjects = []
          cleanedDistricts.sort().forEach((district) => {
            districtObjects.push({ value: district, label: district })
          })
          const titleObjects = []
          cleanedTitles.sort().forEach((title) => {
            titleObjects.push({ value: title, label: title })
          })

          setDistricts(districtObjects)
          setTitles(titleObjects)
          setSalaryData(cleanedData)
        });
    }
    loadEmploymentData()
  }, [])

  let filteredData;
  if (salaryData) {
    filteredData = salaryData.filter((cur) => {
      if (selectedDistrict != null && cur.DistrictName !== selectedDistrict) {
        return false
      }
      if (selectedTitle != null && cur.Duty !== selectedTitle) {
        return false
      }
      return true
    })
  }

  let med;
  let avg;
  let std;
  if (filteredData) {
    med = calcMed(filteredData)
    avg = calcAvg(filteredData)
    std = calcStd(filteredData)
  }

  return (
    <>
      <Head>
        <title>WA Education Salaries</title>
        <meta name="description" content="Data on 2021-22 Washington Education Salarlies" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <main className={styles.classes.pageContainer}>
        <div>
          <h1 className={styles.classes.pageHeader}>Washinton Education Salaries 2021-2022</h1>
          <div className={styles.classes.filterRow}>
            <div className={styles.classes.filterItem}>
              <Select
                label="District"
                placeholder="Select a District"
                searchable
                nothingFound="No Matching Districts"
                onChange={setSelectedDistrict}
                value={selectedDistrict}
                clearable
                data={districts}
              />
            </div>
            <div className={styles.classes.filterItem}>
              <Select
                clearable
                label="Positions"
                placeholder="Select a Position"
                searchable
                nothingFound="No Matching Positions"
                onChange={setSelectedTitle}
                value={selectedTitle}
                data={titles}
              />
            </div>
          </div>
          <div className={styles.classes.statsRow}>
            {filteredData && <StatsGroup data={[
              { stats: med, title: "Median Salary", description: "" },
              { stats: avg, title: "Average Salary", description: "" },
              { stats: std, title: "Standard Deviation", description: "" }
            ]} />
            }
          </div>
          <div className={styles.classes.chartRow}>
            <h2>Salary Distribution</h2>
            {filteredData && filteredData.length > 0 && <SalaryHistogram data={filteredData} width={800} height={400} />}
            {filteredData && filteredData.length === 0 && <h2>No Data</h2>}
          </div>

          <div className={styles.classes.tableRow}>
            {filteredData && <SalaryTable data={filteredData} />}
          </div>

        </div>
      </main>
    </>
  )
}


