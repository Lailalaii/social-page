(function () {
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users/'
  const data = []
  const navbarGroup = document.querySelector('#navbar-group')
  const dataPanel = document.querySelector('#data-panel')
  const myFavorite = document.querySelector('#my-favorite')
  let onFavoritePage = false

  //Send request to Index API
  axios
    .get(INDEX_URL)
    .then(response => {
      response.data.results.forEach(profileData => {
        data.push({ ...profileData, favorite: false })
      })
      displayProfile(data)
    })
    .catch(error => console.log(error))

  //Add event listener to navbarGroup
  navbarGroup.addEventListener('click', event => {
    const target = event.target
    const targetParent = target.parentElement
    if (target.matches('#all') || targetParent.matches('#all')) {
      displayProfile(data)
    } else if (target.matches('#male') || targetParent.matches('#male')) {
      const maleData = data.filter(person => person.gender === 'male')
      displayProfile(maleData)
    } else if (target.matches('#female') || targetParent.matches('#female')) {
      const femaleData = data.filter(person => person.gender === 'female')
      displayProfile(femaleData)
    } else {
      displayProfile(chooseRandomProfiles(4))
    }
    onFavoritePage = false
  })

  //Add event listener to dataPanel
  dataPanel.addEventListener('click', event => {
    if (event.target.matches('.card-img-top')) {
      showProfileDetail(event.target.dataset.id)
    } else if (event.target.matches('.fa-heart')) {
      event.target.classList.toggle('red-heart')
      updateFavoriteStatus(event.target.dataset.id)

      //if the user is on the favorite page remove that profile
      if (onFavoritePage) {
        let profile = event.target.closest('#profile')
        removeFavoriteProfile(profile)
      }
    }
  })

  //Add event listener to Fixed Favorite Button
  myFavorite.addEventListener('click', () => {
    const favoriteData = data.filter(person => person.favorite)
    favoriteData.length !== 0 ? displayProfile(favoriteData) : displayEmptyMessage()
    onFavoritePage = true
  })

  function displayProfile(data) {
    dataPanel.innerHTML = data.map(person => {
      //if the profile has been selected as favorite add red-heart class
      redHeartClass = person.favorite === true ? 'red-heart' : ''
      //return display content
      return `
        <div class='col-md-6 col-xl-4 mb-4' id='profile'>
          <div class='card h-100 shadow'>
            <figure>
              <img src=${person.avatar} class='card-img-top' alt='profile photo' data-toggle='modal' data-target='#profileDetail' data-id='${person.id}'>
            </figure>
            <div class='card-body text-capitalize row'>
              <div class='col-10'>
                <h5 class='card-title'>${person.name} ${person.surname}</h5>
                <p class='card-text text-secondary'>
                  <i class='fas fa-map-marker-alt mr-2'></i>${person.region}
                </p>
              </div>
              <div class='col-2'>
                <h2><i class='fas fa-heart gray-heart ${redHeartClass}' data-id='${person.id}'></i></h2>
              </div>
            </div>
            <div class='card-footer text-muted text-center'>
              <a href='mailto:${person.email}' class='card-link'><i class='far fa-envelope pr-2'></i>Connect Now</a>
            </div>
          </div>
        </div>
      `
    }).join('')
  }

  //randomly find a specific number of profiles
  function chooseRandomProfiles(num) {
    const randomData = []
    for (let i = 0; i < num; i++) {
      let randomIndex = Math.floor(Math.random() * data.length)
      randomData.push(data[randomIndex])
    }
    return randomData
  }

  function showProfileDetail(id) {
    //get elements
    const modalImage = document.getElementById('profile-detail-image')
    const modalName = document.getElementById('profile-detail-name')
    const modalAge = document.getElementById('profile-detail-age')
    const modalBirth = document.getElementById('profile-detail-birth')
    const modalRegion = document.getElementById('profile-detail-region')
    const modalGender = document.getElementById('profile-detail-gender')
    const modalEmail = document.getElementById('profile-detail-connect')

    //set request url
    const SHOW_API = INDEX_URL + id

    //send request to SHOW API
    axios
      .get(SHOW_API)
      .then(response => {
        const data = response.data
        modalImage.src = data.avatar
        modalName.textContent = `${data.name} ${data.surname}`
        modalAge.textContent = `Age: ${data.age}`
        modalBirth.textContent = `Born in: ${data.birthday}`
        modalRegion.textContent = `Nationality: ${data.region}`
        modalEmail.href = `mailto:${data.email}`
        modalGender.textContent = (data.gender === 'male') ? 'Male' : 'Female'
        createFlag(data.region)
      })
  }

  function createFlag(region) {
    //modify country name for special regions
    if (region === 'England') region = 'United Kingdom'

    const modalFlag = document.getElementById('profile-detail-flag')
    const BASE_URL = 'https://restcountries.eu'
    const FLAG_URL = BASE_URL + '/rest/v2/name/' + region + '?fields=flag'

    //send request to REST Countries API
    axios
      .get(FLAG_URL)
      .then(response => modalFlag.src = response.data[0].flag)
      .catch(error => {
        modalFlag.src = ''
        console.log(error)
      })
  }

  function updateFavoriteStatus(id) {
    //update profile data's favorite status 
    data[id - 1].favorite = data[id - 1].favorite ? false : true

    //update the number on check favorite button
    updateFavoriteNumber()
  }

  function updateFavoriteNumber() {
    const number = data.filter(profile => profile.favorite).length
    document.getElementById('favorite-number').textContent = number
  }

  function removeFavoriteProfile(profile) {
    profile.parentElement.removeChild(profile)
    if (dataPanel.children.length === 0) displayEmptyMessage()
  }

  //if no one is selected as favorite, display empty message
  function displayEmptyMessage() {
    dataPanel.innerHTML = `
      <div class='text-center' id='empty-message'>
        <h1><i class='far fa-grin-beam-sweat'></i></h1>
        <h3>No one has been chosen</h3>
      </div>
    `
  }
})()