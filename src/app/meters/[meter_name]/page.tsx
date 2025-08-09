import React from 'react'

const page = ({params}: { params: { meter_name: string }}) => {
    const metername = params.meter_name;
  return (
    <div>{metername}</div>
  )
}

export default page;


