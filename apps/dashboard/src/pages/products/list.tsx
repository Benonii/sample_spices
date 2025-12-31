import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  useSelect,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Image } from "antd";

export const ProductList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { selectProps: categorySelectProps } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="name"
          title={"Name"}
          width={200}
          render={(value) => <strong>{value}</strong>}
        />
        <Table.Column
          dataIndex="price"
          title={"Price"}
          width={100}
          render={(value) => `$${(value ?? 0).toFixed(2)}`}
        />
        <Table.Column
          dataIndex="inventory"
          title={"Inventory"}
          width={100}
          render={(value) => (
            <Tag color={(value ?? 0) > 10 ? 'green' : (value ?? 0) > 0 ? 'orange' : 'red'}>
              {value ?? 0}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="status"
          title={"Status"}
          width={120}
          render={(value) => (
            <Tag color={
              value === 'ACTIVE' ? 'green' :
                value === 'INACTIVE' ? 'orange' :
                  value === 'ARCHIVED' ? 'red' : 'default'
            }>
              {value ?? 'ACTIVE'}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="category"
          title={"Category"}
          width={120}
          render={(value) => {
            const category = categorySelectProps.options?.find(opt => opt.value === value);
            return category?.label || value || 'N/A';
          }}
        />
        <Table.Column
          dataIndex="images"
          title={"Images"}
          width={100}
          render={(images) => {
            if (!images || images.length === 0) return 'No images';
            return (
              <Image
                width={50}
                height={50}
                src={images[0]?.url || images[0]?.thumbUrl || images[0]}
                alt="Product thumbnail"
                style={{ objectFit: 'cover' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ19ynY6NxalDAQ0GRUc9JwK0gtxByBiSHEQJYGHv7wC2O42FGNKdEG1YyRwWg/weCgY2CgZGiQWJQIdwDjN5biNGMjCJt7MyMDcyjwt6D//3zPwO7f7vnf/1O7ZcaAfiw892+run+gaAZ9FoMV4AwN1JAA=="
              />
            );
          }}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          width={120}
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
