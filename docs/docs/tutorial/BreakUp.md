# Break Into Parts

**Break into parts** separates an object that contains disconnected pieces into
individually selectable objects. Use it when an imported mesh or a grouped object
contains several separate pieces that you want to move, edit, or export on their
own.

## Break up selected objects

1. Open your model in **Advanced mode**.
2. Select the objects you want to separate.
3. Click **Break into parts**, immediately to the left of **Simplify mesh** in the
   toolbar. The icon shows a large shape split by a zig-zag gap down the middle.
4. Wait for the operation to finish. The resulting parts become the selection.
5. Clear the selection and select an individual part to work on it separately.

![Break into parts toolbar icon](../img/breakUp.png)

Each selected object is replaced by its disconnected components. The parts stay
in their original positions and keep the source object's color and solid/hole
status. Other objects in the scene are left unchanged. The operation separates
geometry instead of making another overlapping copy of the original.

There are no parameter values to set. Break Into Parts uses the connections in
the existing mesh. For an object with one connected component, the result is one
part in the same position. Increasing the number of triangles with
[refinement](SimplifyMesh.md#adjust-refinement) does not create separate parts.

## Break Into Parts versus Ungroup

**Ungroup** restores the constituent objects of a CaDoodle group. **Break into
parts** separates the disconnected components of the group's resulting mesh.

For example:

- A single imported mesh containing three separate pieces becomes three objects.
- A group containing two separate cubes becomes two objects when its resulting
  mesh has two disconnected components.
- Two overlapping shapes combined into one connected solid remain one part.
- A hole through a connected solid remains a hole in that part; Break Into Parts
  does not restore the cutter used to make it.

Break Into Parts does not cut a connected solid into arbitrary sections or spread
its pieces apart automatically. If a visible seam remains part of one connected
mesh, the seam alone will not produce separate objects.

## Edit or undo the result

Use the normal movement, rotation, and sizing controls on the resulting parts.
Break Into Parts does not restore the original shape-generation controls on each
piece. To change the original construction, return to an earlier step or undo the
Break Into Parts operation.

Use **Undo** to restore the selected source objects in place of their parts.
