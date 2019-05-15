const HttpResult = require('../../common/http/http-result')
const ToolUtil = require('../../common/utils/tool-util')
const signonService = require('../../services/admin/signon-service')
const sceneService = require('../../services/admin/scene-service')
const datetypeService = require('../../services/admin/datetype-service')
const prizeService = require('../../services/admin/prize-service')

// 获取签到类型类表
const getSignonList = async (ctx) => {
  let { page, pageSize, pid } = ctx.request.body
  if (!pid) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signonList = await signonService.getSignonList({ page: page || 1, pageSize: pageSize || 10, platform_id: pid })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, { list: signonList.rows, total: signonList.total }, 'SUCCESS')
}

// 通过id获取签到类型
const getSignonById = async (ctx) => {
  let { id } = ctx.request.body
  if (!id) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, signon, 'SUCCESS')
}

// 增加签到模板
const addSignon = async (ctx) => {
  let { name, checkinType, dateType, number, desc, formId, isResign, resignDates, cost, pid } = ctx.request.body
  if (!name || !checkinType || !dateType || !desc || !pid) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let dateTypeObj = await datetypeService.getOneDateTypeByCons({ type: dateType })
  let extraText = (isResign && parseInt(isResign)) ? { resign: { resign: isResign, form_id: formId, cost: cost, resign_dates: resignDates || [] } } : {}
  let signonData = { platform_id: pid, name: name, checkintype_id: checkinType, rule_desc: desc, cycle_text: JSON.stringify({ type: dateType, name: dateTypeObj[0].name, number: number || 0 }), extra_text: JSON.stringify(extraText) }
  let signon = await signonService.addSignon(signonData)
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, signon, 'SUCCESS')
}

// 更新签到模板
const updateSignonById = async (ctx) => {
  let { id, name, checkinType, dateType, number, desc, formId, isResign, resignDates, cost } = ctx.request.body
  if (!id) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let params = { name: name || signon.name, checkintype_id: checkinType || signon.checkintype_id, rule_desc: desc || signon.rule_desc }
  if (dateType) { // 周期数据
    let dateTypeObj = await datetypeService.getDateTypeById({ id: dateType })
    params.cycle_text = JSON.stringify({ name: dateType.name, number: number || '0', type: parseInt(dateTypeObj.id) })
  }
  if ((checkinType === 2) && (isResign && parseInt(isResign))) { // 连续签到-可补签
    params.extra_text = JSON.stringify({ resign: { resign: isResign, form_id: formId, cost: cost, resign_dates: resignDates || [] } })
  } else {
    params.extra_text = JSON.stringify(signon.extra_text || {})
  }
  let result = await signonService.upDateSignonInfo(params, { id: id })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, { res: result }, 'SUCCESS')
}

// 删除签到类型
const deleteSignon = async (ctx) => {
  let { id } = ctx.request.body
  if (!id) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let result = await signonService.deleteSignon({ ids: [id] })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, { res: result }, 'SUCCESS')
}

// 批删除签到模板
const bulkDeleteSignOn = async (ctx) => {
  let { ids } = ctx.request.body
  if (!ids) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let scenesign = await signonService.deleteSignon({ ids: ids })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, scenesign, 'SUCCESS')
}

// 根据场景id获取签到类型类表
const getSignonListBySceneId = async (ctx) => {
  let { sceneId, type, page, pageSize, pid } = ctx.request.body
  if (!sceneId || !pid) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let params = { sceneId: sceneId, page: page || 1, pageSize: pageSize || 10, platform_id: pid }
  let scene = await sceneService.findOneScene({ id: sceneId })
  let signonList = (parseInt(type) === 1) ? await signonService.getSignonNotInList(params) : await signonService.getSignonInList(params)
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, { list: signonList.rows, scene: scene, total: signonList.total }, 'SUCCESS')
}

// 签到模板批量添加奖品列表
const bulkAddPrizes = async (ctx) => {
  let { id, number, pid, pnum } = ctx.request.body
  if (!id || !number || !pid || !pnum) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let prizesText = signon.prizes_text || {}
  if (!prizesText.prizes) {
    prizesText.prizes = [{ [number]: [{ prize_id: pid, prize_num: pnum }] }]
  } else if (!prizesText.prizes[0][number]) {
    prizesText.prizes[0][number] = [{ prize_id: pid, prize_num: pnum }]
  } else {
    prizesText.prizes[0][number] = prizesText.prizes[0][number].concat({ prize_id: pid, prize_num: pnum })
  }
  let res = await signonService.upDateSignon({ prizes_text: JSON.stringify(prizesText) }, { id: id })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, res, 'SUCCESS')
}

// 签到模板批量删除奖品列表
const bulkDeletePrizes = async (ctx) => {
  let { id, number, prizeIds } = ctx.request.body
  if (!id || !number || !prizeIds) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let prizesText = signon.prizes_text
  if (!(prizesText.prizes && prizesText.prizes[0] && prizesText.prizes[0][number])) {
    ctx.body = HttpResult.response(HttpResult.HttpStatus.FAIL, {}, 'FAIL')
  }
  prizesText.prizes[0][number].forEach((ele, index) => {
    prizeIds.forEach(pid => {
      if (ele.prize_id === pid) {
        prizesText.prizes[0][number].splice(index, 1)
      }
    })
  })
  // prizesText.prizes[0][number] = ToolUtil.removeDuplication(prizesText.prizes[0][number], prizeIds)
  let res = await signonService.upDateSignon({ prizes_text: JSON.stringify(prizesText) }, { id: id })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, res, 'SUCCESS')
}

// 通过id,number, type获取模板的可选择礼品列表
const getPrizesBySignonById = async (ctx) => {
  let { id, number } = ctx.request.body
  if (!id || !number) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let prizesText = signon.prizes_text || {}
  let existPrizes = []
  let prizes = { rows: [], total: 0 }
  if (prizesText.prizes && prizesText.prizes[0] && prizesText.prizes[0][number] && prizesText.prizes[0] && prizesText.prizes[0][number].length) {
    existPrizes = prizesText.prizes[0][number]
    let existIds = []
    existPrizes.forEach(ele => {
      existIds.push(ele.prize_id)
    })
    prizes = await prizeService.getPrizeListInId({ prize_ids: existIds })
    existPrizes.forEach(ele => {
      prizes.rows.forEach(prize => {
        if (ele.prize_id === prize.id) {
          ele.prize = prize
          ToolUtil.prefixImgUrl(ele.prize)
        }
      })
    })
  }
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, { list: existPrizes, total: existPrizes.length }, 'SUCCESS')
}

// 通过id,number, type获取模板的可选择礼品列表
const getConsumesBySignonById = async (ctx) => {
  let { id, date } = ctx.request.body
  if (!id || !date) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let extraText = signon.extra_text || {}
  let consumes = { rows: [], count: 0 }
  let existPrizes = []
  if (extraText.consumes && extraText.consumes[0] && extraText.consumes[0][date] && extraText.consumes[0][date].length) {
    existPrizes = extraText.consumes[0][date]
    let existIds = []
    existPrizes.forEach(ele => {
      existIds.push(ele.prize_id)
    })
    consumes = await prizeService.getPrizeListInId({ prize_ids: existIds })
    existPrizes.forEach(ele => {
      consumes.rows.forEach(prize => {
        if (ele.prize_id === prize.id) {
          ele.prize = prize
          ToolUtil.prefixImgUrl(ele.prize)
        }
      })
    })
  }
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, { list: existPrizes, total: existPrizes.length }, 'SUCCESS')
}

// 签到模板批量添加消耗奖品列表
const bulkAddConsumes = async (ctx) => {
  let { id, date, prid, pnum } = ctx.request.body
  if (!id || !date || !prid) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let extraText = signon.extra_text || {}
  if (!extraText.consumes) {
    extraText.consumes = [{ [date]: [{ prize_id: prid, prize_num: pnum }] }]
  } else if (!extraText.consumes[0][date]) {
    extraText.consumes[0][date] = [{ prize_id: prid, prize_num: pnum }]
  } else {
    extraText.consumes[0][date] = extraText.consumes[0][date].concat({ prize_id: prid, prize_num: pnum })
  }
  let res = await signonService.upDateSignonConsums({ extraText: JSON.stringify(extraText) }, { id: id })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, res, 'SUCCESS')
}

// 签到模板批量删除消耗奖品列表
const bulkDeleteConsumes = async (ctx) => {
  let { id, date, prizeIds } = ctx.request.body
  if (!id || !date || !prizeIds) {
    return (ctx.body = HttpResult.response(HttpResult.HttpStatus.ERROR_PARAMS, null, '参数缺失'))
  }
  let signon = await signonService.getSignonById({ id: id })
  let extraText = signon.extra_text
  if (!(extraText.consumes && extraText.consumes[0] && extraText.consumes[0][date])) {
    ctx.body = HttpResult.response(HttpResult.HttpStatus.FAIL, {}, 'FAIL')
  }
  // extraText.consumes[0][date] = ToolUtil.removeDuplication(extraText.consumes[0][date], [prid])
  extraText.consumes[0][date].forEach((ele, index) => {
    prizeIds.forEach(pid => {
      if (ele.prize_id === pid) {
        extraText.consumes[0][date].splice(index, 1)
      }
    })
  })
  let res = await signonService.upDateSignonConsums({ extraText: JSON.stringify(extraText) }, { id: id })
  ctx.body = HttpResult.response(HttpResult.HttpStatus.SUCCESS, res, 'SUCCESS')
}

module.exports = {
  updateSignonById,
  getSignonList,
  getSignonById,
  getPrizesBySignonById,
  addSignon,
  deleteSignon,
  getSignonListBySceneId,
  bulkDeleteSignOn,
  bulkAddPrizes,
  bulkDeletePrizes,
  getConsumesBySignonById,
  bulkAddConsumes,
  bulkDeleteConsumes
}
