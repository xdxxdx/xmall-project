<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.newsTitle" placeholder="资讯标题" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
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
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封面图" min-width="150px">
        <template slot-scope="{row}">
          <img :src=" row.photoSrc | showImage" width="60" height="40" @click="handleUpdate(row)">
          <!-- <span class="link-type" @click="handleUpdate(row)">http://www.xdx.com{{ row.photoSrc }}</span> -->
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="250px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.newsTitle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="跳转地址" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.jumpUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资讯状态" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag>{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status!=1" size="mini" type="success" @click="handleModifyStatus(row,1)">
            显示
          </el-button>
          <el-button v-if="row.status==1" size="mini" @click="handleModifyStatus(row, -1)">
            隐藏
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="资讯标题" prop="newsTitle">
          <el-input v-model="temp.newsTitle" />
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="跳转地址" prop="jumpUrl">
          <el-input v-model="temp.jumpUrl" placeholder="请填入公众号文章地址" />
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px;  margin-left:50px;">
        <el-form-item label="封面图片" prop="photoSrc">
          <el-upload
            class="avatar-uploader"
            action="/ele/admin/singleUpload/news"
            name="upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="temp.photoSrc" :src="getPhotoUrl" class="carousel">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, create, update, setStatus, hidden } from '@/api/news'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const statusOptions = [
  { key: '0', display_name: '未审核' },
  { key: '1', display_name: '已发布' },
  { key: '-1', display_name: '已下架' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'CarouselManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(key) {
      return statusKeyValue[key]
    }
  },
  data() {
    return {
      statusOptions,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        newsTitle: undefined,
        sort: '-id'
      },
      temp: {
        id: undefined,
        newsTitle: '',
        photoSrc: '',
        jumUrl: '',
        createTime: new Date()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        newsTitle: [{ required: true, message: '必填项', trigger: 'change' }],
        jumpUrl: [{ required: true, message: '必填项', trigger: 'change' }],
        photoSrc: [{ required: true, message: '必填项', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  computed: {
    // 计算属性的 getter
    getPhotoUrl: function() {
      // `this` 指向 vm 实例
      return `http://www.xdx.com${this.temp.photoSrc}`
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
    handleModifyStatus(row, status) {
      const rowTemp = {}
      row.status = status
      rowTemp.status = status
      rowTemp.id = row.id
      setStatus(rowTemp).then(() => {
        const index = this.list.findIndex(v => v.id === row.id)
        this.list.splice(index, 1, this.row) // 更新列表数据
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '设置成功',
          type: 'success',
          duration: 2000
        })
      })
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
    resetTemp() {
      this.temp = {
        id: undefined,
        newsTitle: '',
        photoSrc: '',
        jumpUrl: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          create(this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      console.log(this.temp.photoSrc)
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp) // 更新列表数据
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        hidden(row).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.list.splice(index, 1)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 0) {
        this.temp.photoSrc = res.data
      }
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 1

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!')
      // }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 1MB!')
      }
      // return isJPG && isLt2M
      return isLt2M
    }
  }
}
</script>

<style lang="scss">
  @import '@/styles/upload.scss';
</style>
