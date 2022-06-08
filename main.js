// import jobData from './assets/job-data.json' assert {type: 'json'}
import { getAllElementsMapWithDataJSAttribute } from './utils-module.js'

/**
 * @typedef Filter
 * @property {string} name
 * @property {string[]} list
 */

/**
 * @typedef Job
 * @property {string} name
 * @property {string} icon
 * @property {{value: string, ui_value: string}} location
 * @property {string[]} tags
 * @property {boolean} isPaymentVerified
 * @property {{name: string, time: string, details: {experience: string, location: string, salary_range: string}}} info
 * @property {string} company_overview
 * @property {string[]} requirements
 */

/**
 * @type {{filters: Filter[], jobs: Job[]}}
 */
const jobData = await fetch('./assets/job-data.json').then(r => r.json()).catch(() => null)

if (!jobData) {
  throw new TypeError(`Failed to fetch the resource '.assets/job-data.json'`)
}

const {
  filterAside,
  filterAsideTemplate,

  jobCards,
  jobCardTemplate,

  jobInfo,
  jobInfoTemplate
} = getAllElementsMapWithDataJSAttribute()


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

  filterJobOfferts()
})



function filterJobOfferts() {
  const isAnyFilterApplied = Object.values(filterState).some(filterTypeValues => {
    return Object.values(filterTypeValues).some(filterNameValue => filterNameValue)
  })

  let displayedJobs = jobData.jobs

  if (isAnyFilterApplied) {
    displayedJobs = displayedJobs.filter(job => {
      let matchAnyFilter = false

      if (filterState.Location[job.location.value]) matchAnyFilter = true

      if (job.isPaymentVerified) {
        if (filterState.Payment.Verified) matchAnyFilter = true
      } else {
        if (filterState.Payment.Unverified) matchAnyFilter = true
      }

      if (filterState.Level[job.info.details.experience]) matchAnyFilter = true

      return matchAnyFilter
    })
  }

  populateJobCardsUI(jobCards, jobCardTemplate, displayedJobs)
}

/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {Filter[]} filters
 */
function populateAsideFilterUI(container, template, filters) {
  filters.forEach(filter => {
    /**
     * @type {DocumentFragment}
     */
    const content = template.content.cloneNode(true)

    const filterContainer = content.querySelector('.filter')

    filterContainer.dataset.filterType = filter.name

    filterContainer.querySelector('.title').innerHTML = filter.name

    const labelCheckbox = (function() {
      const item = filterContainer.querySelector('.label-checkbox')
      item.remove()

      return item
    })()

    filter.list.forEach(item => {
      const labelCheckboxItem = filterContainer.appendChild(labelCheckbox.cloneNode(true))
      
      labelCheckboxItem.dataset.filter = item
      labelCheckboxItem.querySelector('.check-box').ariaChecked = false
      labelCheckboxItem.querySelector('.label').innerHTML = item
    })

    container.append(content)
  })
}


/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {Job[]} jobs 
 */
function populateJobCardsUI(container, template, jobs) {
  container.innerHTML = ''

  jobs.forEach((job, index) => {
    /**
     * @type {DocumentFragment}
     */
    const content = template.content.cloneNode(true)

    const jobCard = content.querySelector('.job-card')
    jobCard.dataset.index = index

    jobCard.querySelector('.top > .logo').src = job.icon
    jobCard.querySelector('.top > .title > .name').innerHTML = job.name
    jobCard.querySelector('.top > .title > .location > .text').innerHTML = job.location.ui_value

    const tag = (function() {
      const tag = jobCard.querySelector('.bottom > .tags > .tag')
      tag.remove()

      return tag
    })()

    job.tags.forEach(tagName => {
      const tagClone = tag.cloneNode(true)
      tagClone.innerHTML = tagName

      jobCard.querySelector('.bottom > .tags').append(tagClone)
    })

    if (job.isPaymentVerified) {
      jobCard.querySelector('.bottom > .payment > .icon').src = 'assets/icons/Checkmark Verified.svg'
      jobCard.querySelector('.bottom > .payment > .text').innerHTML = 'Payment Verified'
    } else {
      jobCard.querySelector('.bottom > .payment > .icon').src = 'assets/icons/Checkmark Not Verified.svg'
      jobCard.querySelector('.bottom > .payment > .text').innerHTML = 'Payment Unverified'
    }

    container.append(content)
  })
}
