import React from 'react'
import lodash from 'lodash'

class ModeDiffItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDetail: false
    }
  }

  toggleDetail(e) {
    e.preventDefault()

    this.setState({
      showDetail: !this.state.showDetail
    })
  }

  /**
   * map array by key
   */
  mapArray(array = [], key) {
    const map = {}
    array.forEach((item, index) => {
      map[item[key]] = item
    })
    return map
  }

  /*
   * 计算两个config之间的差异，以ip做key
   */
  getConfigDiff(config, nextConfig) {
    const configMap = this.mapArray(config, 'ip')
    const nextConfigMap = this.mapArray(nextConfig, 'ip')
    const retMap = {}

    nextConfig.forEach((item) => {
      if (!configMap[item.ip]) {
        retMap[item.ip] = {
          type: 'create',
          item: item
        }
      }
    })

    config.forEach((item) => {
      if (!nextConfigMap[item.ip]) {
        retMap[item.ip] = {
          type: 'delete',
          item: item
        }
      } else {
        retMap[item.ip] = {
          type: 'update',
          item: item,
          nextItem: nextConfigMap[item.ip]
        }
      }
    })

    return Object.keys(retMap).map((ip) => {
      return retMap[ip]
    })
  }

  render() {
    const mode = this.props.mode
    // 统一格式
    const config = mode.next ? this.getConfigDiff(mode.config, mode.next.config) : mode.config.map((item) => {
      return {
        type: 'normal',
        item: item
      }
    })

    return (
      <dd>
        { mode.name } <a href="" onClick={this.toggleDetail.bind(this)}>{ this.state.showDetail ? '收起' : '详情'}</a>

        { this.state.showDetail ? (
          <table className="table table-bordered" style={{marginTop: 20}}>
            <thead>
              <tr>
                <th>ip</th>
                <th>url</th>
                <th>分辨率</th>
              </tr>
            </thead>
            <tbody>
            {
              config.map(function(c, index) {
                const classNameMap = {
                  normal: '',
                  'delete': 'danger',
                  create: 'success',
                  update: 'info'
                }
                const item = c.item
                const nextItem = c.nextItem
                const className = lodash.isEqual(item, nextItem) ? '' : classNameMap[c.type]

                return (
                  <tr key={index} className={className}>
                    <td>{ item.ip }</td>
                    <td>
                      {
                        (!nextItem || lodash.isEqual(item, nextItem)) ?
                        (
                          <a href={ item.activeUrl } target="_blank">{ item.activeUrl }</a>
                        ) :
                        (
                          <div>
                          旧：<a href={ item.activeUrl } target="_blank">{ item.activeUrl }</a><br />
                          新：<a href={ nextItem.activeUrl } target="_blank">{ nextItem.activeUrl }</a>
                          </div>
                        )
                      }
                    </td>
                    <td>{ item.resolution }</td>
                  </tr>
                )
              })
            }
            </tbody>
          </table>
        ) : ''}
      </dd>
    )
  }
}

/**
 * 导入配置时显示模式详细信息
 */
export default class ModeDiff extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const modes = this.props.modes || []
    return modes.length ?
      (
        <dl className="dl-horizontal">
          <dt>{ this.props.title }</dt>
          {
            modes.map(function(item, index) {
              return <ModeDiffItem key={index} mode={item} />
            })
          }
        </dl>
      ) : <div />
  }
}