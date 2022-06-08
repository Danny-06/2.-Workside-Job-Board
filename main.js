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
 * @param {{name: string, list: string[]}[]} data 
 */
function populateAsideFilterUI(container, template, data) {
  data.forEach(filter => {
    /**
     * @type {DocumentFragment}
     */
    const content = template.content.cloneNode(true)

    const filterContainer = content.querySelector('.filter')

    filterContainer.querySelector('.title').innerHTML = filter.name

    const labelCheckbox = (function() {
      const item = filterContainer.querySelector('.label-checkbox')
      item.remove()

      return item
    })()

    filter.list.forEach(item => {
      const filterItem = filterContainer.appendChild(labelCheckbox.cloneNode(true))

      filterItem.querySelector('.label').innerHTML = item
    })

    container.append(content)
  })
}


/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {{name: string, icon: string, location: {value: string, ui_value: string}, tags: string[], isPaymentVerified: boolean, info: {name: string, time: number, details: {experience: string, location: string, salary_range: string}, company_overview: string, requirements: string[]}} data 
 */
function populateJobCardsUI(container, template, data) {
  
}
