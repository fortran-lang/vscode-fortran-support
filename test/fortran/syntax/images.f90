program main

  use iso_fortran_env, only: team_type, event_type
  implicit none

  type(team_type) :: team
  type(event_type) :: event[*]
  integer :: image_index, team_index
  integer :: status

  image_index = this_image()
  team_index = merge(1, 2, mod(image_index, 2) == 0)

  !> Test form team
  form team (team_index, team)

  ! Test fail image
  if (team_index == 1) fail image

  !> Test sync all, sync memory
  sync all
  sync all (stat=status)
  sync memory
  sync memory (stat=status)

  !> Test sync team, sync images
  sync team (team_index)
  sync team (team_index, stat=status)
  sync images (image_index)
  sync images (image_index, stat=status)

  !> Test event post and event wait
  event post (event[1])
  event post (event[2])
  event wait (event, until_count=2)

end program main