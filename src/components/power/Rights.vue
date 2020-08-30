<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称" width="width"></el-table-column>
        <el-table-column prop="path" label="路径" width="width"></el-table-column>
        <el-table-column prop="level" label="权限等级" width="width">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level ==='0'">一级权限</el-tag>
            <el-tag type="success" v-if="scope.row.level === '1'">二级权限</el-tag>
            <el-tag type="warning" v-if="scope.row.level === '2'">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用户权限列表
      rightsList: [],
    };
  },
  created() {
    //   获取所有的权限
    this.getRightsList();
  },
  methods: {
    //   获取权限列表
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list");
      //   console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败!");
      }
      //   this.$message.success("获取权限列表成功");
      this.rightsList = res.data;
      // console.log(this.rightsList);
    },
  },
};
</script>

<style lang="less" scoped>
</style>