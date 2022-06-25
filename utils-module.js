/**
 * 
 * @param {HTMLTemplateElement} template 
 * @param {{}} obj 
 * @returns {DocumentFragment}
 */
export function fillDeclarativeTemplate(template, obj) {

  function getInterpolationTokens(string) {
    return string.trim().split(/.{0}(?=\{\{[^{^}]+\}\})|(?<=\{\{[^{^}]+\}\}).{0}/)
    .filter(s => s !== '')
  }

  function computeValueFromInterpolationTokens(tokens, obj) {
    return tokens.map(text => {
      if (!text.startsWith('{{') || !text.endsWith('}}')) return text

      const propertyPath = text.replace('{{', '').replace('}}', '')

      if (propertyPath.startsWith('@') || propertyPath.startsWith('#')) return text

      return getValueFromPropertyPath(obj, propertyPath)
    }).join('')
  }

  function computeValueFromInterpolationTokensLoop(tokens, item, itemName, indexName, currentIndex) {
    return tokens.map(text => {
      if (!text.startsWith('{{') || !text.endsWith('}}')) return text

      const itemPropertyPath = text.replace('{{', '').replace('}}', '')

      if (itemPropertyPath.startsWith(`#${indexName}`)) return currentIndex

      if (!itemPropertyPath.startsWith(`@${itemName}.`) && itemPropertyPath !== `@${itemName}`) return text

      const propertyPath = itemPropertyPath.replace(`@${itemName}.`, '').replace(`@${itemName}`, '') || null

      return getValueFromPropertyPath(item, propertyPath)
    }).join('')
  }

  function computeElementAttributes(element, obj) {
    const attributes = [...element.attributes].filter(attr => attr.nodeName !== '_for_')

    for (let k = 0; k < attributes.length; k++) {
      const attribute = attributes[k]

      const tokens = getInterpolationTokens(attribute.value)

      attribute.value = computeValueFromInterpolationTokens(tokens, obj)
    }
  }

  function computeElementAttributesLoop(element, item, itemName, indexName, currentIndex) {
    const attributes = [...element.attributes].filter(attr => attr.nodeName !== '_for_')

    for (let k = 0; k < attributes.length; k++) {
      const attribute = attributes[k]

      const tokens = getInterpolationTokens(attribute.value)

      attribute.value = computeValueFromInterpolationTokensLoop(tokens, item, itemName, indexName, currentIndex)
    }
  }

  function computeElementTextNodes(element, obj) {
    const childNodes = element.childNodes

    for (let j = 0; j < childNodes.length; j++) {
      const node = childNodes[j]

      if (!(node instanceof Text)) continue

      const tokens = getInterpolationTokens(node.nodeValue)

      node.nodeValue = computeValueFromInterpolationTokens(tokens, obj)
    }
  }

  function computeElementTextNodesLoop(element, item, itemName, indexName, currentIndex) {
    const childNodes = element.childNodes

    for (let k = 0; k < childNodes.length; k++) {
      const node = childNodes[k]

      if (!(node instanceof Text)) continue

      const tokens = getInterpolationTokens(node.nodeValue)

      node.nodeValue = computeValueFromInterpolationTokensLoop(tokens, item, itemName, indexName, currentIndex)
    }
  }

  function getValueFromPropertyPath(obj, propertyPath) {
    if (propertyPath == null) return obj

    propertyPath = propertyPath.split('.')

    let valueHolder = obj

    for (let k = 0; k < propertyPath.length; k++) {
      valueHolder = valueHolder[propertyPath[k]]
    }

    return valueHolder
  }

  function fillDeclarativeElementTree(element, obj) {
    computeElementAttributes(element, obj)
    computeElementTextNodes(element, obj)
  }

  function fillDeclarativeElementTreeLoop(loopElement, obj) {
    const loopTokens = loopElement.getAttribute('_for_').split(/; ?/)

    const propertyPathAndItemName = loopTokens[0].split(' ')

    const itemName = propertyPathAndItemName[0]
    const collectionPropertyPath = propertyPathAndItemName[2]

    const indexName = loopTokens[1]

    if (collectionPropertyPath.includes('@')) return

    loopElement.removeAttribute('_for_')


    const collection = getValueFromPropertyPath(obj, collectionPropertyPath)

    // Save reference for the last element to keep appending elements one after another
    let currentElement = loopElement

    const fistElement = loopElement

    // Read collection

    for (let i = 0; i < collection.length; i++) {
      const item = collection[i]

      const elementCopy = loopElement.cloneNode(true)

      // Read element itself

      computeElementAttributesLoop(elementCopy, item, itemName, indexName, i)
      computeElementTextNodesLoop(elementCopy, item, itemName, indexName, i)


      const innerLoops = elementCopy.querySelectorAll('[_for_]')

      for (let j = 0; j < innerLoops.length; j++) {
        const innerLoop = innerLoops[j]

        const loopTokens = innerLoop.getAttribute('_for_').split(/; ?/)

        const itemNameAndPropertyPath = loopTokens[0].split(' ')

        const innerItemName = itemNameAndPropertyPath[0]
        const innerCollectionPropertyPath = itemNameAndPropertyPath[2]

        const innerIndexName = loopTokens[1]

        // const attrValue = innerLoop.getAttribute('_for_')

        // const tokens = attrValue.split(' ')

        // const innerCollectionPropertyPath = tokens[2]

        if (innerCollectionPropertyPath !== `@${itemName}` && !innerCollectionPropertyPath.startsWith(`@${itemName}.`)) continue

        const computedInnerCollectionPropertyPath = innerCollectionPropertyPath.replace(`@${itemName}`, `${collectionPropertyPath}.${i}`)
        const value = `${innerItemName} of ${computedInnerCollectionPropertyPath}${innerIndexName ? `; ${innerIndexName}`: ''}`

        innerLoop.setAttribute('_for_', value)
      }


      // Read element childs

      const childs = elementCopy.querySelectorAll('*')

      for (let j = 0; j < childs.length; j++) {
        const child = childs[j]

        computeElementAttributesLoop(child, item, itemName, indexName, i)
        computeElementTextNodesLoop(child, item, itemName, indexName, i)
      }

      currentElement.after(elementCopy)

      currentElement = elementCopy
    }

    fistElement.remove()
  }

  if (template instanceof HTMLTemplateElement) {
    const content = template.content.cloneNode(true)

    // Read elements

    const childs = content.querySelectorAll('*')

    for (let i = 0; i < childs.length; i++) {
      fillDeclarativeElementTree(childs[i], obj)
    }

    // Read loop elements

    let loopChilds

    while (loopChilds = content.querySelectorAll('[_for_]'), loopChilds.length) {
      for (let i = 0; i < loopChilds.length; i++) {
        fillDeclarativeElementTreeLoop(loopChilds[i], obj)
      }
    }

    return content
  }

}



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
export function populateAsideFilterUI(filterAside, filterAsideTemplate, filters) {
  const filterAsideContent = fillDeclarativeTemplate(filterAsideTemplate, {filters})
  filterAside.append(filterAsideContent)
}


/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {Job[]} jobs 
 */
 export function populateJobCardsUI(jobCardsContainer, jobCardtemplate, jobs) {
  jobCardsContainer.innerHTML = ''

  const jobCardsContent = fillDeclarativeTemplate(jobCardtemplate, {jobs})
  jobCardsContainer.append(jobCardsContent)
}




/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLTemplateElement} template 
 * @param {Job} jobData 
 */

export function displayJobInfoUI(jobInfoContainer, jobInfoTemplate, jobData) {
  jobInfoContainer.innerHTML = ''

  const jobInfoContent = fillDeclarativeTemplate(jobInfoTemplate, jobData)
  jobInfoContainer.append(jobInfoContent)
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
