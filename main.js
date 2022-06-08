import jobData from './assets/job-data.json' assert {type: 'json'}
import { getAllElementsMapWithDataJSAttribute } from './utils-module.js'


const {
  filterAside,
  filterAsideTemplate,

  jobCards,
  jobCardTemplate,
  jobInfo
} = getAllElementsMapWithDataJSAttribute()


populateAsideFilterUI(filterAside, filterAsideTemplate, jobData.filters)

populateJobCardsUI(jobCards, jobCardTemplate, jobData.jobs)





// Handle filter check-box toggle
window.addEventListener('click', event => {
  if (!event.target.parentElement.matches('.label-checkbox')) return

  if (event.target.matches('.check-box'))
    event.target.classList.toggle('-checked')
  else
    if (event.target.matches('.label'))
      event.target.previousElementSibling.classList.toggle('-checked')
})




/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {{name: string, list: string[]}[]} filters 
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
      const filterItem = filterContainer.appendChild(labelCheckbox.cloneNode(true))

      filterItem.dataset.filter = item
      filterItem.querySelector('.label').innerHTML = item
    })

    container.append(content)
  })
}


/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {{name: string, icon: string, location: {value: string, ui_value: string}, tags: string[], isPaymentVerified: boolean, info: {name: string, time: number, details: {experience: string, location: string, salary_range: string}, company_overview: string, requirements: string[]}}[]} jobs 
 */
function populateJobCardsUI(container, template, jobs) {
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
