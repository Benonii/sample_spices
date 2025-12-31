import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/utils/authClient";

export const ProductCreate = () => {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  
  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "product",
    action: "create",
    // Try to prevent automatic form handling
    redirect: false,
  });

  useEffect(() => {
    if (formProps.form) {
      const formData = formProps.form.getFieldsValue();
    }
  }, [formProps.form, uploadedImages]);

  const { selectProps: categorySelectProps } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
  });

  // Function to get presigned URL and upload image
  const handleImageUpload = async (file: RcFile): Promise<any> => {
    try {
      setUploading(true);
      
      // Get presigned URL from backend
      const presignedResponse = await fetch('http://localhost:5000/api/upload/presigned_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      
      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URL');
      }
      
      const presignedData = await presignedResponse.json();
      
      // Upload file to Supabase using presigned URL
      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      return {
        storageKey: presignedData.storageKey,
        fileName: file.name,
        imageUrl: presignedData.imageUrl,
        imagePath: presignedData.imagePath,
        isPrimary: uploadedImages.length === 0, // First image is primary
        orderIndex: uploadedImages.length
      };
      
    } catch (error) {
      message.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <Create saveButtonProps={{
      ...saveButtonProps,
      loading: submitting,
      disabled: submitting || uploading
    }}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={async (values: any) => {
          
          // Validate userID first
          if (!session?.user?.id) {
            message.error('User session not found. Please log in again.');
            return;
          }
          
          // Set submitting state for loading feedback
          setSubmitting(true);
          
          try {
            // Format the data for submission
            const formattedValues = {
              ...values,
              images: Array.isArray(uploadedImages) ? uploadedImages : [],
              userID: session.user.id
            };
                        
            const response = await fetch('http://localhost:5000/api/admin/product', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formattedValues)
            });
            
            if (response.ok) {
              const result = await response.json();
              message.success('Product created successfully!');
              
              // Clear the form state to prevent unsaved changes warning
              if (formProps.form) {
                formProps.form.resetFields();
                setUploadedImages([]);
              }
              
              // Navigate after successful submission
              navigate('/products');
            } else {
              const error = await response.json();
              console.error('❌ Product creation failed:', error);
              message.error(`Failed to create product: ${error.message || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('💥 Product creation exception:', error);
            message.error('Failed to create product');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form.Item
          label={"Name"}
          name="name"
          rules={[
            {
              required: true,
              message: "Product name is required",
            },
          ]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          label={"Description"}
          name="description"
          rules={[
            {
              required: true,
              message: "Product description is required",
            },
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Enter product description"
          />
        </Form.Item>

        <Form.Item
          label={"Price"}
          name="price"
          rules={[
            {
              required: true,
              message: "Price is required",
            },
            {
              type: "number",
              min: 0,
              message: "Price must be a positive number",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="0.00"
            precision={2}
            min={0}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          label={"Inventory"}
          name="inventory"
          rules={[
            {
              required: true,
              message: "Inventory quantity is required",
            },
            {
              type: "number",
              min: 0,
              message: "Inventory must be a non-negative number",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="0"
            min={0}
            precision={0}
          />
        </Form.Item>

        <Form.Item
          label={"Category"}
          name="categoryID"
          rules={[
            {
              required: true,
              message: "Category is required",
            },
          ]}
        >
          <Select
            placeholder="Select a category"
            {...categorySelectProps}
          />
        </Form.Item>

        <Form.Item
          label={"Status"}
          name="status"
          initialValue="ACTIVE"
          rules={[
            {
              required: true,
              message: "Status is required",
            },
          ]}
        >
          <Select>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="INACTIVE">Inactive</Select.Option>
            <Select.Option value="ARCHIVED">Archived</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={"Upload Images"}
        >
          <Upload
            listType="picture-card"
            maxCount={5}
            multiple={true}
            accept="image/*"
            beforeUpload={async (file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                message.error('You can only upload image files!');
                return false;
              }
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return false;
              }
              
              try {
                const imageData = await handleImageUpload(file);
                
                // Add to uploaded images state
                setUploadedImages(prev => {
                  const newImages = [...prev, imageData];
                  
                  return newImages;
                });
                
                
                message.success(`${file.name} uploaded successfully!`);
              } catch (error) {
                message.error(`Failed to upload ${file.name}`);
              }
              
              return false; // Prevent default upload behavior
            }}
            onChange={(info) => {
              if (info.file.status === 'removed') {
                // Handle file removal - only update state
                const fileToRemove = info.file as any;
                setUploadedImages(prev => {
                  const newImages = prev.filter(img => img.storageKey !== fileToRemove.storageKey);
                  
                  return newImages;
                });
              }
            }}
            fileList={uploadedImages.map((img, index) => ({
              uid: img.storageKey || `img-${index}`,
              name: img.fileName,
              status: 'done',
              url: img.imageUrl,
              thumbUrl: img.imageUrl,
              storageKey: img.storageKey
            }))}
            itemRender={(originNode, file, fileList, { remove }) => (
              <div style={{ position: 'relative' }}>
                {originNode}
                <Button
                  type="text"
                  size="small"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: '#ff4d4f',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => remove()}
                >
                  ×
                </Button>
              </div>
            )}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              padding: '8px'
            }}>
              {uploading ? (
                <>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>🔄</div>
                  <span style={{ fontSize: '12px' }}>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadOutlined style={{ fontSize: '16px', marginBottom: '4px' }} />
                  <span style={{ fontSize: '12px' }}>Upload</span>
                </>
              )}
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Create>
  );
};