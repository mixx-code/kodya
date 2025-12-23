async function DetailLanding({params} : {params: Promise<{id: string}>}) {
    const { id } = await params;
  return (
    <div>DetailLanding, id : {id}</div>
  )
}

export default DetailLanding