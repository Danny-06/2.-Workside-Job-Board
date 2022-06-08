// import jobData from './assets/job-data.json' assert {type: 'json'}
import {
  getAllElementsMapWithDataJSAttribute,
  getJobData,
  populateAsideFilterUI, populateJobCardsUI, populateJobInfoUI,
  filterJobOfferts
} from './utils-module.js'


const jobData = await getJobData()

if (!jobData) {
  throw new TypeError(`Failed to fetch the resource`)
}

const {
  filterAside,
  filterAsideTemplate,

  jobCards,
  jobCardTemplate,

  jobInfo,
  jobInfoTemplate
} = getAllElementsMapWithDataJSAttribute()


/**
 * Handle the state of the filters applied to the jobs
 */
const filterState = {}

jobData.filters.forEach(filter => {
  filterState[filter.name] = {}

  filter.list.forEach(item => filterState[filter.name][item] = false)
})



populateAsideFilterUI(filterAside, filterAsideTemplate, jobData.filters)

populateJobCardsUI(jobCards, jobCardTemplate, jobData.jobs)





// Handle filter check-box toggle
window.addEventListener('click', event => {
  if (!event.target.parentElement.matches('.label-checkbox')) return

  let checkbox

  if (event.target.matches('.check-box'))
    checkbox = event.target
  else if (event.target.matches('.label'))
    checkbox = event.target.previousElementSibling

  if (!checkbox) return

  const filterType = checkbox.parentElement.parentElement.dataset.filterType
  const filterName = checkbox.parentElement.dataset.filter

  filterState[filterType][filterName] = checkbox.ariaChecked = checkbox.classList.toggle('-checked')

  const displayedJobs = filterJobOfferts(jobData, filterState)

  populateJobCardsUI(jobCards, jobCardTemplate, displayedJobs)
})


