import sys

with open('products.module.css', 'r') as f:
    lines = f.readlines()

with open('temp_modal.css', 'r') as f:
    new_css = f.read()

index_modal = -1
for i, line in enumerate(lines):
    if '/* ===== Modal ===== */' in line:
        index_modal = i
        break

if index_modal != -1:
    with open('products.module.css', 'w') as f:
        f.writelines(lines[:index_modal])
        f.write('\n' + new_css)
else:
    print('Did not find Modal comment')
