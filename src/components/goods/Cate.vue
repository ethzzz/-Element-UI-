<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-button type="primary">添加分类</el-button>

      <!-- 列表区域 -->
      <el-table :data="cateList" style="width: 100%">
        <el-table-column prop="prop" label="商品名称" width="width"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品列表
      cateList: [],
      //   商品总数
      total: 0,
    };
  },
  created() {
    //   获取所有商品数据
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败!");
      }
      // 把获取的商品列表赋值到 cateList中
      this.cateList = res.data.result;
      //   为商品总数赋值
      this.total = res.data.total;
      //   console.log(this.cateList)
    },
  },
};
</script>

<style lang="less" scoped>
</style>