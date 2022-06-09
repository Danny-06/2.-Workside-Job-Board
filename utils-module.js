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
 * @property {{name: string, time: string, details: {experience: string, location: string, salary_range: string}, company_overview: string, requirements: string[]}} info
 */

/**
 * 
 * @returns {Promise<{filters: Filter[], jobs: Job[]}>}
 */
export function getJobData() {
  return fetch('./assets/job-data.json').then(r => r.json()).catch(() => null)
}

export function filterJobOfferts(jobData, filterState) {
  const isAnyFilterApplied = Object.values(filterState).some(filterTypeValues => {
    return Object.values(filterTypeValues).some(filterNameValue => filterNameValue)
  })

  let displayedJobs = jobData

  // Show if it matches at least one of the filters

  // if (isAnyFilterApplied) {
  //   displayedJobs = displayedJobs.filter(job => {
  //     let matchAnyFilter = false

  //     if (filterState.Location[job.location.value]) matchAnyFilter = true

  //     if (job.isPaymentVerified) {
  //       if (filterState.Payment.Verified) matchAnyFilter = true
  //     } else {
  //       if (filterState.Payment.Unverified) matchAnyFilter = true
  //     }

  //     if (filterState.Level[job.info.details.experience]) matchAnyFilter = true

  //     return matchAnyFilter
  //   })
  // }

  // Show if it matches all the filters

  if (isAnyFilterApplied) {
    displayedJobs = displayedJobs.filter(job => {
      for (const locationName in filterState.Location) {
        if (!filterState.Location[locationName]) continue

        if (job.location.value !== locationName) return false
      }

      for (const paymentName in filterState.Payment) {
        if (!filterState.Payment[paymentName]) continue

        switch (paymentName) {
          case 'Verified':
            if (!job.isPaymentVerified) return false
          break

          case 'Unverified':
            if (job.isPaymentVerified) return false
          break

          default:
        }
      }

      for (const levelName in filterState.Level) {
        if (!filterState.Level[levelName]) continue

        if (job.info.details.experience !== levelName) return false
      }

      return true
    })
  }

  return displayedJobs
}

/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {Filter[]} filters
 */
export function populateAsideFilterUI(container, template, filters) {
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
export function populateJobCardsUI(container, template, jobs) {
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


/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {Job} jobData 
 */
export function displayJobInfoUI(container, template, jobData) {
  const content = template.content.cloneNode(true)

  content.querySelector('.header > .title > .name').innerHTML = jobData.info.name
  content.querySelector('.header > .title > .location').innerHTML = jobData.info.details.location
  content.querySelector('.header > .time').innerHTML = jobData.info.time

  content.querySelector('.details > .experience    > .value').innerHTML = jobData.info.details.experience
  content.querySelector('.details > .location      > .value').innerHTML = jobData.info.details.location
  content.querySelector('.details > .salaryrange   > .value').innerHTML = jobData.info.details.salary_range

  content.querySelector('.companyoverview > .text').innerHTML = jobData.info.company_overview

  const requirementItem = (function() {
    const item = content.querySelector('.jobrequirements > .requirements > .item')
    item.remove()

    return item
  })()

  jobData.info.requirements.forEach(requirementText => {
    const requirement = requirementItem.cloneNode(true)

    requirement.querySelector('.text').innerHTML = requirementText

    content.querySelector('.jobrequirements > .requirements').append(requirement)
  })

  container.innerHTML = ''
  container.append(content)
}









/**
 * @param {Document | Element} node
 * @returns {{[key: string]: HTMLElement}}
 */
 export function getAllElementsMapWithDataJSAttribute(node = document) {
  const hyphenToLowerCase = string => string.split('-').map((str, index) => index !== 0 ? str[0].toUpperCase() + str.slice(1) : str).join('')

  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document)) throw new TypeError(`param 1 must be an instance of Element or Document`)

  const elements = node.querySelectorAll('*')

  const map = {}

  elements.forEach(element => {
    const dataJSPrefix = 'data-js-'
    const attribute = [...element.attributes].filter(attribute => attribute.name.startsWith(dataJSPrefix))[0]

    if (attribute == null) return

    const name  = hyphenToLowerCase(attribute.name.slice(dataJSPrefix.length))

    if (name in map) throw new DOMException(`data attribute js must be unique:\n[${attribute.name}]`)

    map[name] = element
  })

  return map
}

/**
 * 
 * @param {Document | Element} node 
 * @returns {{[key: string]: HTMLElement}}
 */
export function getAllElementsMapWithId(node = document) {
  const hyphenToLowerCase = string => string.split('-').map((str, index) => index !== 0 ? str[0].toUpperCase() + str.slice(1) : str).join('')

  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document)) throw new TypeError(`param 1 must be an instance of Element or Document`)

  const elements = node.querySelectorAll('[id]')

  const map = {}

  elements.forEach(element => {
    const keyId = hyphenToLowerCase(element.id)

    if (element.id === '') throw new DOMException(`'id' attribute cannot be empty`)

    if (keyId in map) throw new DOMException(`'id' attribute must be unique:\n#${element.id}`)

    map[keyId] = element
  })

  return map
}
