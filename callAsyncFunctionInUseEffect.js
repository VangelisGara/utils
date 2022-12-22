function Example() {
  const [data, dataSet] = useState<any>(null)

  useEffect(() => {
    async function fetchMyAPI() {
      let response = await fetch('api/data')
      response = await response.json()
      dataSet(response)
    }

    fetchMyAPI()
  }, [])

  return <div>{JSON.stringify(data)}</div>
}
