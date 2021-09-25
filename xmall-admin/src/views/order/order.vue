<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.userName" placeholder="联系人/电话" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户提交时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.receiveTime">{{ row.receiveTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销时间" min-width="150px">
        <template slot-scope="{row}">
          <span v-if="row.recoveryTime">{{ row.recoveryTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="二维码" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.bagCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="网点" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.user.house.city.cityName + " "+ row.user.house.houseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.user.contactName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户电话" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.user.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.user.contactPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="150px">
        <template slot-scope="{row}">
          <el-tag>{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="垃圾类别" min-width="150px">
        <template slot-scope="{row}">
          <el-tag>{{ row.bagType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="重量(g)" min-width="150px">
        <template slot-scope="{row}">
          <el-tag>{{ row.weight }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="本次返佣(元）" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.rakeBack }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleAddBalance(row)">
            返佣
          </el-button>
          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            积分
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status!=1" size="mini" type="success" @click="handleModifyStatus(row,1)">
            启用
          </el-button>
          <el-button v-if="row.status==1" size="mini" @click="handleModifyStatus(row, -1, $index)">
            冻结
          </el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchList } from '@/api/order'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const statusOptions = [
  { key: 0, display_name: '未审核' },
  { key: 1, display_name: '已核销' },
  { key: -1, display_name: '不合格' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'AgencyManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(key) {
      return statusKeyValue[key]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userName: undefined,
        sort: '-id'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      downloadLoading: false,
      errorCity: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
