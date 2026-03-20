# Upload Image Endpoint

## Muc tieu

Tai lieu nay mo ta endpoint upload anh len server va luong hoat dong khi luu duong dan vao truong imageUrl cua cac PC Component.

## Endpoint

- Method: POST
- URL: /api/files/upload
- Content-Type: multipart/form-data

### Form-data

- file: MultipartFile (bat buoc)
- entity: string (tuy chon, vi du: cpu, mainboard, ram, vga, ssd, hdd, psu, cooler, case)

## Phan hoi mau

```json
{
  "url": "/identity/images/cpu-550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

## Luong hoat dong

1. Client gui request POST /api/files/upload voi multipart/form-data, gom file va entity.
2. Server kiem tra file khong rong.
3. Server tao ten file duy nhat theo format {entity}-{uuid}.{ext} va giu nguyen duoi file.
4. Server luu file vao thu muc vat ly /uploads/images (tao neu chua ton tai).
5. Server tra ve URL public cua anh theo format: {app.base-url}/images/{filename}.
6. Khi tao/cap nhat PC Component, client luu URL nay vao truong imageUrl (chi luu URL, khong luu BLOB/Base64).
7. Truy cap GET /images/{filename} de lay anh.

## Luu y cau hinh

- app.base-url trong application.yaml se anh huong URL tra ve.
- /images/\*\* duoc map den thu muc vat ly /uploads/images qua WebMvcConfigurer.
- Chi luu URL vao database, khong luu byte[] hoac Base64.
