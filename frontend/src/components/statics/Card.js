import React from 'react'

function Card(props) {
  return (
    <div class="card">
    <div class="card-body">
      <h5 class="card-title">{props.title}</h5>
      <p class="card-text">{props.text}</p>
      <a href={props.link} target="_blank" class="btn btn-primary">Go</a>
    </div>
  </div>
  )
}

export default Card